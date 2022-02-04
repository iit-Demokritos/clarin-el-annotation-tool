from django.contrib.auth.tokens import PasswordResetTokenGenerator
from six import text_type
from pymongo import MongoClient
from django.conf import settings
from rest_framework.views import APIView

####################################################
## ErrorLoggingAPIView
####################################################
from rest_framework.response import Response
from rest_framework import status
from inspect import signature
import sys, os
from .models import Users, Collections, SharedCollections
from django.db.models import Q

class ErrorLoggingAPIViewList:
    http_method_names = ["get", "post"]

class ErrorLoggingAPIViewDetail:
    http_method_names = ["get", "put", "patch", "delete"]

class ErrorLoggingAPIView(APIView):
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
    def userHasAccessToCollection(user, collection):
        # collection = Collections.objects.get(id=cid)
        if collection.owner_id_id == user.id:
            return True
        if SharedCollections.objects \
            .filter((Q(tofield   = user) & Q(confirmed = 1)),
                    collection_id = collection) \
            .count():
            return True
        raise Exception("User does not have access to this Collection!")

    @staticmethod
    def getCollection(user, cid):
        collection = Collections.objects.get(pk=cid)
        ErrorLoggingAPIView.userHasAccessToCollection(user, collection)
        return collection

    def logException(self, ex, method):
        print(self.__class__.__name__, "-", method+"() - Catch Exception:", ex)
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
            return self.logException(ex, "list/retrieve")

    def post(self, request, *args, **kwargs):
        try:
            data = self.create(request, *args, **kwargs)
            return self.returnResponse(data, "create")
        except Exception as ex:
            return self.logException(ex, "create")

    def put(self, request, *args, **kwargs):
        try:
            data = self.update(request, *args, **kwargs)
            return self.returnResponse(data, "update")
        except Exception as ex:
            return self.logException(ex, "update")

    def patch(self, request, *args, **kwargs):
        try:
            data = self.partial_update(request, *args, **kwargs)
            return self.returnResponse(data, "partial_update")
        except Exception as ex:
            return self.logException(ex, "partial_update")

    def delete(self, request, *args, **kwargs):
        try:
            data = self.destroy(request, *args, **kwargs)
            return self.returnResponse(data, "destroy")
        except Exception as ex:
            return self.logException(ex, "destroy")

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


def get_clarindb():
    hostname    = settings.MONGO_DB_HOST
    port_number = settings.MONGO_DB_PORT
    user        = settings.MONGO_USERNAME
    password    = settings.MONGO_PASSWORD
    db_name     = settings.MONGO_DATABASE
    clarindb    = None
    mongoclient = None
    try:
        mongo_con="mongodb://"+user+":"+password+"@"+hostname+":"+str(port_number)
        mongoclient = MongoClient(mongo_con)
        clarindb = mongoclient["clarin"]
    except Exception as ex:
        print(ex)
    return clarindb, mongoclient


def get_collection_handle(db_handle, collection_name):
    if not db_handle:
        return None
    names = db_handle.list_collection_names()
    if collection_name in names:
        return db_handle[collection_name]
    return None

db_handle, mongo_client = get_clarindb()
#annotations = get_collection_handle(db_handle, "annotations")
#annotations_temp = get_collection_handle(db_handle, "annotations_temp")
