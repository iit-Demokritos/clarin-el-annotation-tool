from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
# from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.views import APIView, View

from deepdiff import DeepDiff
from deepdiff.helper import CannotCompare

from .models import Users, Collections, SharedCollections, OpenDocuments, Documents, \
    ButtonAnnotators, CoreferenceAnnotators
from .utils import ErrorLoggingAPIView, ErrorLoggingAPIViewList, ErrorLoggingAPIViewDetail, get_collection_handle
from .utils import MongoDBAccess, db_handle as mongodb_db_clarin
from django.utils import timezone
from drf_spectacular.utils import extend_schema_view, extend_schema

import json

class MongoDBAPIView(MongoDBAccess, ErrorLoggingAPIView):
    pass

##############################################
## Annotations
##############################################
@method_decorator(ensure_csrf_cookie, name='dispatch')
class AnnotationsView(MongoDBAPIView):
    http_method_names = ["get", "post", "delete"]
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
            return self.mongodb_find_one({'_id': self.mongodb_encode_id(Button_Annotator_name)})


    # Create a new instance. (POST)
    def create(self, request, cid, did, importing=False):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.get(pk=did)

        annotator_id = None;
        # Have we received a single annotation?
        if type(request.data['data']) is list:
            annotations = request.data['data']
            importing_set = True;
        else:
            annotations = [request.data['data']]
            importing_set = False;
        if importing_set:
            importing = importing_set
        for annotation in annotations:
            # Just make sure during migration, that annotation does not exist
            try:
                self.db.delete_one({'_id': self.mongodb_encode_id(annotation['_id'])})
            except Exception:
                pass

            new_ann = {
                '_id':           self.mongodb_encode_id(annotation['_id']),
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
            self.db.delete_one({'_id': self.mongodb_encode_id(param)})
        return {'db_interactions': 0}


@extend_schema_view(
    ## Method: list
    get=extend_schema(request=None,responses={200: None},operation_id="list_all_annotations",
        description="Gets collection id and document id and returns a list with the annotations of the document with the given id.",
    ),
    ## Method: create
    post=extend_schema(request=None,responses={200: None},
        description="Gets collection id,document id and annotation data and creates annotation record."
        
    ),# change line for parameters?
    delete=extend_schema(request=None,responses={200: None},operation_id="delete_all_annotations",
        description="Gets collection id,document id and deletes all the annotations of the document",
    ),
)
class AnnotationsViewList(ErrorLoggingAPIViewList, AnnotationsView):
     http_method_names = ["get", "post","delete"]

@extend_schema_view(
    ## Method: retrieve
    get=extend_schema(request=None,responses={200: None},operation_id="list_specific_annotations",
        description="Gets collection id,document id and a parameter: <br/> annotator id for retrieving a list with the annotations of the document with the given id  and the given annotator. <br/>  annotation id for retrieving a single annotation",
    ),
    ## Method: destroy
    delete=extend_schema(request=None,responses={200: None},operation_id="delete_specific_annotations",
        description="Gets collection id,document id and a parameter: <br/> annotator id for deleting all the annotations of the document for the given annotator. <br/> annotation id for deleting a single annotation.",
    ),
)
class AnnotationsViewDetail(AnnotationsView):
   http_method_names = ["get", "delete"]



##############################################
## Temp Annotations
##############################################
@method_decorator(ensure_csrf_cookie, name='dispatch')
class TempAnnotationsView(MongoDBAPIView):
    http_method_names = ["get", "post","put" "delete"]
    db_name = 'annotations_temp'
    optional = [
        'document_attribute',
        'collection_setting',
        'document_setting',
        'created_at'
    ]
    timestamps = [
      'updated_by',
      'updated_at'
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
            return self.mongodb_find_one({'_id':        self.mongodb_encode_id(param),
                                          'deleted_at': {'$exists': False}})

    # Create a new instance. (POST)
    def create(self, request, cid, did):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.get(pk=did)
        user       = Users.objects.get(email=request.user.email)

        annotator_id  = None;
        # Have we received a single annotation?
        if type(request.data['data']) is list:
            annotations = request.data['data']
            importing_set = True;
        else:
            annotations=[request.data['data']]
            importing_set = False;
        for annotation in annotations:
            new_ann = {
                '_id':           self.mongodb_encode_id(annotation['_id']),
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
            ## Important: The only siituation where we are importing a set,
            ## is when the Annotation Tool initialises temp Annotations
            ## from the saved Annotations. KEEP TIMESTAMPS!
            if importing_set:
               for field in self.timestamps:
                   if field in annotation:
                       new_ann[field] = annotation[field]
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
        ann        = self.mongodb_find_one({'_id': self.mongodb_encode_id(param)})

        annotation            = self.mongodb_doc_fix_id(request.data['data'])
        new_ann               = ann | annotation # merges the two dictionaries, python > 3.9
        new_ann['updated_by'] = request.user.email
        new_ann['updated_at'] = timezone.now()
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
            tm = timezone.now()
            status = self.db.update_one({'_id': self.mongodb_encode_id(param)}, {
                '$set': {'updated_by': request.user.email,
                         'updated_at': tm,
                         'deleted_by': request.user.email,
                         'deleted_at': tm}
            })
            ann = self.mongodb_find_one({'_id': self.mongodb_encode_id(param)})
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

@extend_schema_view(
    ## Method: list
    get=extend_schema(request=None,responses={200: None},operation_id="list_all_temp_annotations",
        description="Gets collection id and document id and returns a list with the temp annotations of the document with the given id.",
    ),
    ## Method: create
    post=extend_schema(request=None,responses={200: None},
        description="Gets collection id,document id and annotation data and creates temp annotation record."
        
    ),# change line for parameters?
    delete=extend_schema(request=None,responses={200: None},operation_id="delete_all_temp_annotations",
        description="Gets collection id,document id and deletes all the temp annotations of the document",
    ),
)
class TempAnnotationsViewList(ErrorLoggingAPIViewList, TempAnnotationsView):
     http_method_names = ["get", "post","delete"]

@extend_schema_view(
    ## Method: retrieve
    get=extend_schema(request=None,responses={200: None},operation_id="list_specific_temp_annotations",
        description="Gets collection id,document id and a parameter: <br/> annotator id for retrieving a list with the temp annotations of the document with the given id  and the given annotator. <br/> temp annotation id for retrieving a single temp annotation",
    ),
    put=extend_schema(request=None,responses={200: None},
        description="Gets collection id,document id,temp annotation id and updates temp annotation with the given id"),
    ## Method: destroy
    delete=extend_schema(request=None,responses={200: None},operation_id="delete_specific_temp_annotations",
        description="Gets collection id,document id and a parameter: <br/> annotator id for deleting all the temp annotations of the document for the given annotator. <br/> annotation id for deleting a single temp annotation.",
    ),
)
class TempAnnotationsViewDetail(TempAnnotationsView):
  http_method_names = ["get","put","delete"]


##############################################
## Annotation Diff
##############################################
class AnnotationDiffView(ErrorLoggingAPIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.annotationsView = AnnotationsView()
        self.annotationsTempView = TempAnnotationsView()
        self.request       = None
        self.cid           = None
        self.did           = None
        self.annotatorName = None

    @property
    def annotations(self):
        if self.annotatorName == None:
            return self.annotationsView.list(self.request, self.cid, self.did)
        else:
            return self.annotationsView.retrieve(self.request, self.cid, self.did, self.annotatorName)

    @property
    def annotations_temp(self):
        if self.annotatorName == None:
            return self.annotationsTempView.list(self.request, self.cid, self.did)
        else:
            return self.annotationsTempView.retrieve(self.request, self.cid, self.did, self.annotatorName)

    # List all instances. (GET)
    def list(self, request, cid, did):
        self.request       = request
        self.cid           = cid
        self.did           = did
        self.annotatorName = None
        return self.compare();

    # Retrieve a single instance. (GET)
    def retrieve(self, request, cid, did, Button_Annotator_name):
        self.request       = request
        self.cid           = cid
        self.did           = did
        self.annotatorName = Button_Annotator_name
        return self.compare();

    def simplify_annotation(self, ann):
        ann.pop("owner_id", None)
        return ann

    def compare(self):
        annotations      = list(map(self.simplify_annotation, self.annotations))
        annotations_temp = list(map(self.simplify_annotation, self.annotations_temp))
        diff = DeepDiff(annotations, annotations_temp,
                        ignore_order=True,
                        iterable_compare_func=self.compare_func,
                        group_by='_id')
        json_data = json.loads(diff.to_json())
        annotations_added   = len(json_data.get("dictionary_item_added", []))
        annotations_removed = len(json_data.get("dictionary_item_removed", []))
        annotations_changed = len(json_data.get("values_changed", {}))
        changes             = annotations_added + annotations_removed + annotations_changed
        return {
            #'diff':  json_data,
            #'descr': diff.pretty(),
            'changes':             changes,
            'annotations_added':   annotations_added,
            'annotations_removed': annotations_removed,
            'annotations_changed': annotations_changed
        }

    @staticmethod
    def compare_func(x, y, level=None):
        try:
            return x['_id'] == y['_id']
        except Exception:
            raise CannotCompare() from None

class AnnotationDiffViewList(AnnotationDiffView):
     http_method_names = ["get"]

class AnnotationDiffViewDetail(AnnotationDiffView):
     http_method_names = ["get"]
