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

class ErrorLoggingAPIView(APIView):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        ## Get the number of arguments of the list & retrieve methods...
        sig_list     = signature(self.list)
        sig_retrieve = signature(self.retrieve)
        self.arguments_list     = list(sig_list.parameters.keys())[1:] # drop 'request'
        self.arguments_retrieve = list(sig_retrieve.parameters.keys())[1:] # drop 'request'
        # print("##############", self.arguments_list, self.arguments_retrieve)

    def logException(self, ex, method):
        print(self.__class__.__name__, "-", method+"() - Catch Exception:", ex)
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type, fname, exc_tb.tb_lineno)
        return Response(data={
            "success": False,
            "message": "An error occured: " + str(ex)
            }, status=status.HTTP_200_OK)


    def get(self, request, *args, **kwargs):
        try:
            ## Are the arguments of retrieve satisfiled?
            if all(param in kwargs for param in self.arguments_retrieve):
                data = self.retrieve(request, *args, **kwargs)
            elif all(param in kwargs for param in self.arguments_list):
                data = self.list(request, *args, **kwargs)
            else:
                raise "Cannot decide over list() or retrieve()!"
            return Response(data={"success": True, "data": data},
                            status=status.HTTP_200_OK)
        except Exception as ex:
            return self.logException(ex, "list/retrieve")

    def post(self, request, *args, **kwargs):
        try:
            data = self.create(request, *args, **kwargs)
            return Response(data={"success": True, "data": data},
                            status=status.HTTP_200_OK)
        except Exception as ex:
            return self.logException(ex, "create")

    def put(self, request, *args, **kwargs):
        try:
            data = self.update(request, *args, **kwargs)
            return Response(data={"success": True, "data": data},
                            status=status.HTTP_200_OK)
        except Exception as ex:
            return self.logException(ex, "update")

    def patch(self, request, *args, **kwargs):
        try:
            data = self.partial_update(request, *args, **kwargs)
            return Response(data={"success": True, "data": data},
                            status=status.HTTP_200_OK)
        except Exception as ex:
            return self.logException(ex, "partial_update")

    def delete(self, request, *args, **kwargs):
        try:
            data = self.destroy(request, *args, **kwargs)
            return Response(data={"success": True, "data": data},
                            status=status.HTTP_200_OK)
        except Exception as ex:
            return self.logException(ex, "destroy")

    # From: https://github.com/encode/django-rest-framework/blob/master/rest_framework/mixins.py

    # List all instances.
    def list(self, request):
        pass
    # Retrieve a single instance.
    def retrieve(self, request, pk):
        pass
    # Create a new instance.
    def create(self, request):
        pass
    # Update an existing instance.
    def update(self, request, pk):
        pass
    # Partially update an existing instance.
    def partial_update(self, request, pk):
        pass
    # Destroy an existing instance.
    def destroy(self, request, pk):
        pass

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
    hostname = settings.MONGO_DB_HOST
    port_number=settings.MONGO_DB_PORT
    user=settings.MONGO_USERNAME
    password=settings.MONGO_PASSWORD
    db_name=settings.MONGO_DATABASE
    clarindb=None
    mongoclient=None
    try:
       # print(hostname)
        #print(port_number)
        #print(user)
        #print(password)
        #print(db_name)
        mongo_con="mongodb://"+user+":"+password+"@"+hostname+":"+str(port_number)
       # print(mongo_con)
        #print("mongodb://clarinel:CeimUgyediaskibwawEijWir@localhost:27017")
        mongoclient = MongoClient(mongo_con)
        clarindb = mongoclient["clarin"]
        #mongoclient = MongoClient(host=hostname, port=port_number,username=user,password=password,
      #  authSource=db_name)#?
       # mongoclient.server_info()
    except Exception as ex:
            print(ex)


    #print(mongoclient
   # clarindb = mongoclient["clarin"]
    #print(clarindb)
    return clarindb, mongoclient


def get_collection_handle(db_handle, collection_name):
    # print(db_handle[collection_name])
    return db_handle[collection_name]


db_handle, mongo_client = get_clarindb()
#annotations = get_collection_handle(db_handle, "annotations")
#annotations_temp = get_collection_handle(db_handle, "annotations_temp")
