from django.contrib.auth.tokens import PasswordResetTokenGenerator
from six import text_type
from pymongo import MongoClient
from django.conf import settings
from rest_framework.views import APIView

from .models import Users, Collections, Documents, SharedCollections
from django.db.models import Q
from django.db.models.functions import Lower
from django.forms.models import model_to_dict
from django.utils import timezone

from bson.objectid import ObjectId

####################################################
## SQL Model Access...
####################################################

class SQLModelAccess:
    @staticmethod
    def userHasAccessToCollection(user, collection):
        # collection = Collections.objects.get(id=cid)
        if collection.owner_id_id == user.id:
            return True
        if SharedCollections.objects \
            .filter((Q(tofield = user) & Q(confirmed = 1)),
                    collection_id = collection) \
            .count():
            return True
        raise Exception("User does not have access to this Collection!")

    @staticmethod
    def getCollection(user, cid):
        collection = Collections.objects.get(pk=cid)
        SQLModelAccess.userHasAccessToCollection(user, collection)
        return collection

    @staticmethod
    def getCollectionDocuments(user, collection):
        return Documents.objects.filter(collection_id=collection).order_by(Lower('name'))

    @staticmethod
    def getCollectionDocumentCount(user, collection):
        return Documents.objects.filter(collection_id=collection).count()

    @staticmethod
    def getUserCollections(user):
        collections        = Collections.objects.filter(owner_id=user).order_by(Lower('name'))
        return collections

    @staticmethod
    def getSharedToUserCollections(user):
        collections        = SharedCollections.objects.filter((Q(tofield=user) & Q(confirmed=1))).order_by(Lower('name'))
        return collections

    @staticmethod
    def getSharedByUserCollections(user):
        collections        = SharedCollections.objects.filter((Q(fromfield=user) & Q(confirmed=1))).order_by(Lower('name'))
        return collections

    @staticmethod
    def getCollections(user):
        shared_collections = SharedCollections.objects.filter((Q(tofield=user) & Q(confirmed=1))).values("collection_id")
        collections        = Collections.objects.filter(Q(owner_id=user) | Q(pk__in=shared_collections)).order_by(Lower('name'))
        return collections

    @staticmethod
    def collectionToDict(object):
        return model_to_dict(object)

    @staticmethod
    def documentToDict(object, request=None):
        doc_record = model_to_dict(object)
        if request:
            doc_record['data_image']  = request.build_absolute_uri(doc_record['data_image'].url) if doc_record['data_image'].name else None
            doc_record['data_file']   = request.build_absolute_uri(doc_record['data_file'].url)  if doc_record['data_file'].name  else None
        else:
            doc_record['data_image']  = doc_record['data_image'].url if doc_record['data_image'].name else None
            doc_record['data_file']   = doc_record['data_file'].url  if doc_record['data_file'].name  else None
        ## Normalise newlines, as expected by codemirror:
        ##   lineSeparator: string|null
        ##   Explicitly set the line separator for the editor. By default (value null),
        ##   the document will be split on CRLFs as well as lone CRs and LFs,
        ##   and a single LF will be used as line separator in all output
        doc_record['text']            = SQLModelAccess.normaliseNewlines(doc_record['text'])
        doc_record['data_text']       = SQLModelAccess.normaliseNewlines(doc_record['data_text'])
        return doc_record

    ## Normalise newlines, as expected by codemirror:
    ##   lineSeparator: string|null
    ##   Explicitly set the line separator for the editor. By default (value null),
    ##   the document will be split on CRLFs as well as lone CRs and LFs,
    ##   and a single LF will be used as line separator in all output
    @staticmethod
    def normaliseNewlines(text):
        return text
        if not text:
            return text
        return "\n".join(text.splitlines())

####################################################
## MongoDB Access...
####################################################
def get_clarindb():
    hostname    = settings.MONGO_DB_HOST
    port_number = settings.MONGO_DB_PORT
    db_auth     = settings.MONGO_DB_AUTH
    user        = settings.MONGO_USERNAME
    password    = settings.MONGO_PASSWORD
    db_name     = settings.MONGO_DATABASE
    clarindb    = None
    mongoclient = None
    try:
        mongo_con=f"mongodb://{user}:{password}@{hostname}:{port_number}/?authSource={db_auth}"
        mongoclient = MongoClient(mongo_con)
        clarindb = mongoclient[db_name]
    except Exception as ex:
        print(ex)
    return clarindb, mongoclient


def get_collection_handle(db_handle, collection_name):
    if db_handle is None:
        return None
    names = db_handle.list_collection_names()
    if collection_name in names:
        return db_handle[collection_name]
    return None

db_handle, mongo_client = get_clarindb()
#annotations = get_collection_handle(db_handle, "annotations")
#annotations_temp = get_collection_handle(db_handle, "annotations_temp")

class MongoDBAccess:
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
        return get_collection_handle(db_handle, self.db_name)

    @staticmethod
    def mongodb_encode_id(id):
        if type(id) is str:
            # Decide if it is a UUID or an ObjectID:
            if '-' in id:
                # Leave it as a string...
                return id
            else:
                return ObjectId(id)

    @staticmethod
    def mongodb_doc_fix_id(doc):
        if '_id' in doc and type(doc['_id']) is not str:
            doc['_id'] = str(doc['_id'])
        return doc

    @staticmethod
    def mongodb_doc_add_id(doc):
        if '_id' in doc and type(doc['_id']) is str:
            doc['_id'] = MongoDBAccess.mongodb_encode_id(doc['_id'])
        return doc

    @staticmethod
    def add_timestamps(ann):
        if 'created_at' in ann:
            if 'updated_at' not in ann:
                ann['updated_at'] = timezone.now()
        else:
            ann['created_at'] = timezone.now()
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


####################################################
## ErrorLoggingAPIView
####################################################
from rest_framework.response import Response
from rest_framework import status
from inspect import signature
import sys, os

class ErrorLoggingAPIViewList:
    http_method_names = ["get", "post"]

class ErrorLoggingAPIViewDetail:
    http_method_names = ["get", "put", "patch", "delete"]

class ErrorLoggingAPIView(APIView, SQLModelAccess):
    """
    Base class to implement an error logging APIView.
    """
    status_exception_default  = status.HTTP_400_BAD_REQUEST
    status_exception          = status.HTTP_400_BAD_REQUEST
    data_exception            = {}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        ## Get the number of arguments of the list & retrieve methods...
        sig_list     = signature(self.list)
        sig_retrieve = signature(self.retrieve)
        self.arguments_list     = list(sig_list.parameters.keys())[1:] # drop 'request'
        self.arguments_retrieve = list(sig_retrieve.parameters.keys())[1:] # drop 'request'
        # print("##############", self.arguments_list, self.arguments_retrieve)

    @staticmethod
    def mongoDBHandle(db_name="annotations"):
        return get_collection_handle(db_handle, db_name)

    @property
    def annotations(self):
        return self.mongoDBHandle()

    @property
    def annotationsTemp(self):
        return self.mongoDBHandle("annotations_temp")

    @staticmethod
    def ensureAuthenticatedUser(request):
        if not request.user.is_authenticated:
            raise Exception("An authenticated user is required.")

    def logException(self, request, ex, method):
        print(self.__class__.__name__, "-", method+"() - Catch Exception:", ex)
        print(" User:", request.user, request.user.pk, request.user.email)
        tb = ex.__traceback__
        # Skip the outer layer...
        if tb is not None:
            tb = tb.tb_next
        if tb is not None:
            print("filename:", tb.tb_frame.f_code.co_filename,
                  "name:", tb.tb_frame.f_code.co_name,
                  "lineno:", tb.tb_lineno)
        else:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
        response = Response(data={
            "success": False,
            "message": str(ex),
            "data": self.data_exception
            }, status=self.status_exception)
        self.status_exception = self.status_exception_default
        self.data_exception   = {}
        return response

    def returnResponse(self, data, method):
        if isinstance(data, Response):
            return data
        if type(data) is tuple:
            # Expects two elements, data & status
            return Response(data=data[0], status=data[1])
        return Response(data={"success": True, "data": data},
                            status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        try:
            ## Are the arguments of retrieve satisfiled?
            if all(param in kwargs for param in self.arguments_retrieve):
                data = self.retrieve(request, *args, **kwargs)
                method = 'retrieve'
            elif all(param in kwargs for param in self.arguments_list):
                data = self.list(request, *args, **kwargs)
                method = 'list'
            else:
                raise "Cannot decide over list() or retrieve()!"
            return self.returnResponse(data, method)
        except Exception as ex:
            return self.logException(request, ex, "list/retrieve")

    def post(self, request, *args, **kwargs):
        try:
            data = self.create(request, *args, **kwargs)
            return self.returnResponse(data, "create")
        except Exception as ex:
            return self.logException(request, ex, "create")

    def put(self, request, *args, **kwargs):
        try:
            data = self.update(request, *args, **kwargs)
            return self.returnResponse(data, "update")
        except Exception as ex:
            return self.logException(request, ex, "update")

    def patch(self, request, *args, **kwargs):
        try:
            data = self.partial_update(request, *args, **kwargs)
            return self.returnResponse(data, "partial_update")
        except Exception as ex:
            return self.logException(request, ex, "partial_update")

    def delete(self, request, *args, **kwargs):
        try:
            data = self.destroy(request, *args, **kwargs)
            return self.returnResponse(data, "destroy")
        except Exception as ex:
            return self.logException(request, ex, "destroy")

    # From: https://github.com/encode/django-rest-framework/blob/master/rest_framework/mixins.py

    # List all instances. (GET)
    def list(self, request):
        raise NotImplementedError
    # Retrieve a single instance. (GET)
    def retrieve(self, request, detail):
        raise NotImplementedError
    # Create a new instance. (POST)
    def create(self, request):
        raise NotImplementedError
    # Update an existing instance. (PUT)
    def update(self, request, detail):
        raise NotImplementedError
    # Partially update an existing instance. (PATCH)
    def partial_update(self, request, detail):
        raise NotImplementedError
    # Destroy an existing instance. (DELETE)
    def destroy(self, request, detail):
        raise NotImplementedError

class AppTokenGenerator(PasswordResetTokenGenerator):

    def _make_hash_value(self, user, timestamp):
        return (text_type(user.is_active) + \
                text_type(user.pk) + \
                text_type(timestamp))


account_activation_token = AppTokenGenerator()


class InvitationTokenGenerator(PasswordResetTokenGenerator):
    invitation_hash = None

    def make_my_hash_value(self, touser_pk, cid):
        InvitationTokenGenerator.invitation_hash = (text_type(touser_pk) + \
                                                    text_type(cid))

    def _make_hash_value(self, user, timestamp):
        return (text_type(user.is_active) + \
                text_type(user.pk) + \
                text_type(InvitationTokenGenerator.invitation_hash) + \
                text_type(timestamp))


invitation_token = InvitationTokenGenerator()
