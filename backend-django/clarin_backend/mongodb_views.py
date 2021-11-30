from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
# from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.views import APIView, View

from .models import Users, Collections, SharedCollections, OpenDocuments, Documents, \
    ButtonAnnotators, CoreferenceAnnotators

from .utils import ErrorLoggingAPIView, get_collection_handle
from .utils import db_handle as mongodb_db_clarin
from bson.objectid import ObjectId
import datetime

class MongoDBAPIView(ErrorLoggingAPIView):
    db_name = ''
    
    returnProperties = {
        # You cannot change a property to '0', the property has to
        # be commented out!
        '_id':                1,
        'collection_id':      1,
        'document_id':        1,
        'owner_id':           1,
        'annotator_id':       1,
        'document_attribute': 1,
        'type':               1,
        'spans':              1,
        'attributes':         1,
        'created_at':         1,
        'created_by':         1,
        'updated_at':         1,
        'updated_by':         1,
        'deleted_at':         1,
        'deleted_by':         1,
        'collection_setting': 1,
        'document_setting':   1
    }

    @property
    def db(self):
        return get_collection_handle(mongodb_db_clarin, self.db_name)

    @staticmethod
    def mongodb_doc_fix_id(doc):
        if '_id' in doc and type(doc['_id']) is not str:
            doc['_id'] = str(doc['_id'])
        return doc

    @staticmethod
    def mongodb_doc_add_id(doc):
        if '_id' in doc and type(doc['_id']) is str:
            doc['_id'] = ObjectId(doc['_id'])
        return doc

    @staticmethod
    def add_timestamps(ann):
        if 'created_at' in ann:
            if 'updated_at' not in ann:
                ann['updated_at'] = datetime.datetime.now()
        else:
            ann['created_at'] = datetime.datetime.now()
            ann['updated_at'] = ann['created_at']
        return ann

    @staticmethod
    def mongodb_doc_is_not_deleted(doc):
        return 'deleted_at' not in doc

    def mongodb_find(self, query, projection=returnProperties):
        return map(self.mongodb_doc_fix_id, self.db.find(self.mongodb_doc_add_id(query), projection))

    def mongodb_find_one(self, query, projection=returnProperties):
        return self.mongodb_doc_fix_id(self.db.find_one(self.mongodb_doc_add_id(query), projection))

    def mongodb_insert_one(self, ann):
        return self.db.insert_one(self.add_timestamps(ann))

    def mongodb_update_one(self, ann):
        id = ann['_id']
        del ann['_id']
        return self.db.update_one(self.mongodb_doc_add_id({'_id': id}),
                                  {"$set": self.add_timestamps(ann)})

    def remove_deleted(self, docs):
        return filter(self.mongodb_doc_is_not_deleted, docs)


##############################################
## Annotations
##############################################
@method_decorator(ensure_csrf_cookie, name='dispatch')
class AnnotationsView(MongoDBAPIView):
    db_name = 'annotations'

    optional = [
        'document_attribute',
        'collection_setting',
        'document_setting',
        'created_at'
    ]

    # List all instances. (GET)
    def list(self, request, cid, did):
        collection = self.getCollection(request.user, cid)
        return self.mongodb_find({'collection_id': cid,
                                  'document_id':   did})

    # Retrieve a single instance. (GET)
    def retrieve(self, request, cid, did, Button_Annotator_name):
        collection = self.getCollection(request.user, cid)
        if '_' in Button_Annotator_name:
            return self.mongodb_find({'collection_id': cid,
                                      'document_id':   did,
                                      'annotator_id':  Button_Annotator_name})
        else:
            return self.mongodb_find_one({'_id': ObjectId(Button_Annotator_name)})


    # Create a new instance. (POST)
    def create(self, request, cid, did, importing=False):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.get(pk=did)

        annotator_id = None;
        # Have we received a single annotation?
        if type(request.data['data']) is list:
            annotations = request.data['data']
        else:
            annotations = [request.data['data']]
        for annotation in annotations:
            # Just make sure during migration, that annotation does not exist
            try:
                self.db.delete_one({'_id': ObjectId(annotation['_id'])})
            except Exception:
                pass

            new_ann = {
                '_id':           ObjectId(annotation['_id']),
                'collection_id': cid,
                'document_id':   did,
                'owner_id':      request.user.id,
                'type':          annotation['type'],
                'spans':         annotation['spans'],
                'attributes':    annotation['attributes'],
                'created_by':    annotation.get('created_by', request.user.email),
                'updated_by':    annotation.get('updated_by', request.user.email) \
                                 if importing else request.user.email
            }
            for field in self.optional:
                if field in annotation:
                    new_ann[field] = annotation[field]
            # 'annotator_id' does not exist in older exports.
            if 'annotator_id' in annotation:
                new_ann['annotator_id'] = annotation['annotator_id'];
                if annotator_id is None:
                    annotator_id = annotation['annotator_id'];
            if importing and 'updated_at' in annotation:
                new_ann['updated_at'] = annotation['updated_at']
            self.mongodb_insert_one(new_ann)
        opendocuments = OpenDocuments.objects.filter(
            collection_id  = collection,
            document_id    = document,
            annotator_type = annotator_id)
        for od in opendocuments:
            od.db_interactions = 0
            od.save()
        return {'db_interactions': 0}

    # # Update an existing instance. (PUT)
    # def update(self, request, cid, did, Button_Annotator_name):
    #     raise "Unsupported()!"

    # # Partially update an existing instance. (PATCH)
    # def partial_update(self, request, cid, did, Button_Annotator_name):
    #     raise "Unsupported()!"

    # Destroy an existing instance. (DELETE)
    def destroy(self, request, cid, did, Button_Annotator_name):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.get(pk=did)
        param      = Button_Annotator_name

        if (not param) or (param == 'null'):
            # Remove everything!
            self.db.delete_many({'collection_id': cid,
                                 'document_id':   did})
            increment = 0
        elif '_' in param:
            # We have an annotator id...
            annotator_id = param
            self.db.delete_many({'collection_id': cid,
                                 'document_id':   did,
                                 'annotator_id':  annotator_id})
        else:
            # We have an annotation id, delete a single annotation...
            self.db.delete_one({'_id': ObjectId(param)})
        return {'db_interactions': 0}


##############################################
## Temp Annotations
##############################################
@method_decorator(ensure_csrf_cookie, name='dispatch')
class TempAnnotationsView(MongoDBAPIView):
    db_name = 'annotations_temp'
    optional = [
        'document_attribute',
        'collection_setting',
        'document_setting',
        'created_at'
    ]

    # List all instances. (GET)
    def list(self, request, cid, did):
        collection = self.getCollection(request.user, cid)
        return self.mongodb_find({'collection_id': cid,
                                  'document_id':   did,
                                  'deleted_at':    {'$exists': False}})

    # Retrieve a single instance. (GET)
    def retrieve(self, request, cid, did, param):
        collection = self.getCollection(request.user, cid)
        if '_' in param:
            return self.mongodb_find({'collection_id': cid,
                                      'document_id':   did,
                                      'annotator_id':  param,
                                      'deleted_at':    {'$exists': False}})
        else:
            return self.mongodb_find_one({'_id':        ObjectId(param),
                                          'deleted_at': {'$exists': False}})

    # Create a new instance. (POST)
    def create(self, request, cid, did):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.get(pk=did)
        user       = Users.objects.get(email=request.user.email)

        annotator_id = None;
        # Have we received a single annotation?
        if type(request.data['data']) is list:
            annotations = request.data['data']
        else:
            annotations=[request.data['data']]
        for annotation in annotations:
            new_ann = {
                '_id':           ObjectId(annotation['_id']),
                'collection_id': cid,
                'document_id':   did,
                'owner_id':      request.user.id,
                'annotator_id':  annotation.get('annotator_id', annotator_id),
                'type':          annotation['type'],
                'spans':         annotation['spans'],
                'attributes':    annotation['attributes'],
                'created_by':    annotation.get('created_by', request.user.email),
                'updated_by':    request.user.email
            }
            for field in self.optional:
                if field in annotation:
                    new_ann[field] = annotation[field]
            # 'annotator_id' does not exist in older exports.
            if 'annotator_id' in annotation:
                new_ann['annotator_id'] = annotation['annotator_id'];
                if annotator_id is None:
                    annotator_id = annotation['annotator_id'];
            self.mongodb_insert_one(new_ann)

        opendocument = (OpenDocuments.objects.filter(
            collection_id = collection,
            document_id   = document,
            user_id       = user.pk)).get()
        opendocument.db_interactions += len(annotations)
        opendocument.save()
        return {'db_interactions': opendocument.db_interactions}

    # Update an existing instance. (PUT)
    def update(self, request, cid, did, param):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.get(pk=did)
        user       = Users.objects.get(email=request.user.email)
        ann        = self.mongodb_find_one({'_id': ObjectId(param)})

        annotation            = self.mongodb_doc_fix_id(request.data['data'])
        new_ann               = ann | annotation # merges the two dictionaries, python > 3.9
        new_ann['updated_by'] = request.user.email
        new_ann['updated_at'] = datetime.datetime.now()
        self.mongodb_update_one(new_ann)
        opendocument = (OpenDocuments.objects.filter(
            collection_id = collection,
            document_id   = document,
            user_id       = user.pk)).get()
        opendocument.db_interactions += 1
        opendocument.save()
        return {'db_interactions': opendocument.db_interactions}

    # Partially update an existing instance. (PATCH)
    def partial_update(self, request, cid, did, param):
        return self.update(request, cid, did, param)

    # Destroy an existing instance. (DELETE)
    # We do not delete annotations, instead we add 'deleted_at', because they need to
    # appear in LIVE, for updating tool when annotations get deleted.
    def destroy(self, request, cid, did, param):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.get(pk=did)

        increment       = 1
        annotator_id    = None
        db_interactions = None
        if (not param) or (param == 'null'):
            # Remove everything!
            status = self.db.delete_many({'collection_id': cid,
                                 'document_id':   did})
            increment = status.deleted_count
        elif '_' in param:
            # We have an annotator id...
            annotator_id = param
            status = self.db.delete_many({'collection_id': cid,
                                 'document_id':   did,
                                 'annotator_id':  annotator_id})
            increment = status.deleted_count
        else:
            # We have an annotation id, delete a single annotation...
            tm = datetime.datetime.now()
            status = self.db.update_one({'_id': ObjectId(param)}, {
                '$set': {'updated_by': request.user.email,
                         'updated_at': tm,
                         'deleted_by': request.user.email,
                         'deleted_at': tm}
            })
            ann = self.mongodb_find_one({'_id': ObjectId(param)})
            annotator_id = ann.get('annotator_id', None)

        if annotator_id:
            opendocuments = OpenDocuments.objects.filter(
                collection_id  = collection,
                document_id    = document,
                annotator_type = annotator_id)
            for od in opendocuments:
                if increment:
                    od.db_interactions += increment
                    od.save()
                if not db_interactions:
                    db_interactions = od.db_interactions
        if not db_interactions:
            db_interactions = 0
        return {'db_interactions': db_interactions}
