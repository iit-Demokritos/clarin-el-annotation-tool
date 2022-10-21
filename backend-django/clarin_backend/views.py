from django.http import StreamingHttpResponse
from django.db import connection
from .uniqid import uniqid
import mysql.connector
import os
from datetime import datetime, timedelta
from re import I
import time

from django.utils import encoding
from django.utils.decorators import method_decorator
from django.conf import settings

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.template import loader
# Create your views here.
from django.template.loader import get_template
from django.views import View
from pymongo import collection
from rest_framework.exceptions import ValidationError

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView, View

from .handlers import HandlerClass
from .send_email import EmailAlert
from django.contrib.sites.shortcuts import get_current_site
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from .serializers import MyTokenObtainPairSerializer, CustomUserSerializer, SharedCollectionsSerializer, \
    OpenDocumentsSerializer, ButtonAnnotatorsSerializer, CoreferenceAnnotatorsSerializer, CollectionsSerializer, \
    DocumentsSerializer
from django.utils.encoding import force_bytes, force_str, DjangoUnicodeDecodeError
from django.contrib.sites.shortcuts import get_current_site
from .utils import account_activation_token, invitation_token, get_collection_handle
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.urls import reverse
from .models import Users, Collections, SharedCollections, OpenDocuments, Documents, ButtonAnnotators, \
    CoreferenceAnnotators
from .utils import db_handle, mongo_client

from bson.objectid import ObjectId
from django.forms.models import model_to_dict
import jwt
from django.db.models import Q
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
import json
from django.conf import settings
from DjangoClarin import authentication

from drf_spectacular.utils import extend_schema_view, extend_schema

@method_decorator(ensure_csrf_cookie, name='dispatch')
class ObtainTokenPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    # refresh homepage in https://annotation.ellogon.org/

    # Angular UI seems to user the same url for logging in, and
    # for loading the login page. Thus, this function must have
    # both a GET & POST methods, doing different things (returning
    # the main HTML page & logining in).
    @extend_schema(request=None,responses={200: None},description="Loading login page.")
    def get(self, request):
        host = request.get_host()
        index = 'index.html'
        if host in ['clarin.ellogon.org', 'www.ellogon.org', 'annotation-compat.ellogon.org']:
            index = 'anjularjs_index.html'
        # print("InitApp:", host, index);
        return render(request, index)
    
    @extend_schema(request=None,responses={200: None},description="Takes a set of user credentials and returns an access and refresh JSON web token pair to prove the authentication of those credentials.")
    def post(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(serializer.validated_data,
                            status=status.HTTP_200_OK)

        if ("access" in serializer.validated_data.keys()):
            return authentication.setJWTCookie(response, serializer.validated_data['access'])
        else:
            return Response(serializer.validated_data, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class InitApp(View):
    @extend_schema(request=None,responses={200: None},description="Redirect to homepage.")
    def get(self, request):
        host = request.get_host()
        index = 'index.html'
        if host in ['clarin.ellogon.org', 'www.ellogon.org', 'annotation-compat.ellogon.org']:
            index = 'anjularjs_index.html'
        # print("InitApp:", host, index);
        return render(request, index)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class RefreshTokenView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response = Response(serializer.validated_data,
                            status=status.HTTP_200_OK)
        return authentication.setJWTCookie(response, serializer.validated_data['access'])


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CustomUserCreate(APIView):
    
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    
    @extend_schema(request=None,responses={200: None},description="Takes a set of personal data (email, first name, last name, password), creates a new user and sends activation email.")
    def post(self, request, format='json'):
        # TODO: protect on error!

        data = {"email": request.data['email'], "first_name": request.data["first_name"], "last_name": request.data["last_name"],
                "password": request.data["password"], "username": request.data["first_name"]+"_"+request.data["last_name"]}
        serializer = CustomUserSerializer(data=data)

        if serializer.is_valid():
            user = serializer.save()
            if user:

                try:
                    # Send an e-mail for activating the user!
                    json = serializer.data
                    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                    token = account_activation_token.make_token(user)
                    link = reverse('user_activate', kwargs={
                                   'uidb64': uidb64, 'token': token})
                    activation_link = request.build_absolute_uri(link)
                    content = {"user": (user.first_name+" "+user.last_name), "link": activation_link,
                               "email": request.data['email'],
                               "baseurl": request.build_absolute_uri("/")[:-1],
                             #  "ellogon_logo": "https://vast.ellogon.org/images/logo.jpg"}
                               "ellogon_logo": request.build_absolute_uri(settings.APP_LOGO)}  # path?
                    activation_alert = EmailAlert(
                        request.data['email'], (user.first_name+" "+user.last_name), content)
                    activation_alert.send_activation_email()
                    json = {"success": True,
                            "message": "You were successfully registered"}
                    return Response(json, status=status.HTTP_200_OK)
                except Exception as e:
                    user.delete()
                    print("CustomUserCreate error:"+str(e))
                    return Response({"success": False, "message": "Registration Error: "+str(e)}, status=status.HTTP_400_BAD_REQUEST)
        print("CustomUserCreate error:"+str(serializer.errors))
        return Response({"success": False, "message": "Registration Error: "+str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class LogoutAndBlacklistRefreshTokenForUserView(APIView):

    #permission_classes = (permissions.AllowAny,)
    #authentication_classes = ()
    @extend_schema(request=None,responses={200: None},description="User Logout")
    def get(self, request):
        try:
            email = request.user
            user = Users.objects.get(email=email)
            tokens = OutstandingToken.objects.filter(user_id=request.user.id)
            for token in tokens:
                t, _ = BlacklistedToken.objects.get_or_create(token=token)
            return authentication.deleteJWTCookie(Response({"success": True, "message": "You successfully signed out."}, status=status.HTTP_200_OK))
        except Exception as e:
            print("LogoutAndBlacklistRefreshTokenForUserView get error:"+str(e))
            return Response({"success": True, "message": "Logout error:"+str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
    @extend_schema(request=None,responses={200: None},description="User Logout")
    def post(self, request):
        try:

            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return authentication.deleteJWTCookie(Response({"success": True, "message": "You successfully signed out."}, status=status.HTTP_205_RESET_CONTENT))
        except Exception as e:
            print("LogoutAndBlacklistRefreshTokenForUserView post error:"+str(e))
            return Response({"success": True, "message": "Logout error:"+str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ?
@method_decorator(ensure_csrf_cookie, name='dispatch')
class ActivationView(View):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request, uidb64, token):

        id = force_str(urlsafe_base64_decode(uidb64))
        user = Users.objects.get(pk=id)
        baseurl = request.get_host()
        #baseurl = request.build_absolute_uri('/')
        #if "127.0.0.1:8000" in baseurl:
        #    baseurl = "https://localhost:4200/"
        #message = {"message": "Your account is activated successfully",
        #           "base_url": baseurl}

        if ((not account_activation_token.check_token(user, token)) or user.is_active):
            message = {"message": "Your account has been already activated", "ellogon_logo": request.build_absolute_uri(settings.APP_LOGO),
                       "base_url": baseurl+"auth/login"}
        user.is_active = True
        user.save()
        template = loader.get_template('activateview.html')

        return HttpResponse(template.render(message, request))


class GetCsrfToken(APIView):
  
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    
    @extend_schema(request=None,responses={200: None},description="Gets X-XSRF-token")
    def get(self, request):
        csrf_token_val = get_token(request)
        request.META["X-XSRF-TOKEN"] = csrf_token_val
        return Response(data={"success": True, "data": []},
                        status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ChangePassword(APIView):

    @extend_schema(request=None,responses={200: None},description="Gets current password and new password and updates user's password.")
    def post(self, request):
        try:
            email = request.user
            user = Users.objects.get(email=email)
            data = {"email": email, "password": request.data['old_password']}
            passstatus = check_password(data["password"], user.password)

            if (passstatus == True):
                user.set_password(request.data["new_password"])
                user.save()
                return Response(data={"success": True, "message": "Your password was successfully updated"},
                                status=status.HTTP_200_OK)
            else:
                return Response(data={"success": False, "message": "Your current password does not match"},
                                status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("ChangePassword error:"+str(e))
            return Response(data={"success": False, "message": "Update password error:"+str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class InitPasswords(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        users = Users.objects.all()
        for user in users:
            password = Users.objects.make_random_password()
            user.set_password(password)
            user.save()
            user_ref = user.first_name+" "+user.last_name
            content = {"user": user_ref, "password": password, "email": user.email,
                       "baseurl": request.build_absolute_uri("/")[:-1],
                       "ellogon_logo": request.build_absolute_uri(settings.APP_LOGO)}
            reset_alert = EmailAlert(user.email, user.first_name, content)
            reset_alert.send_resetpassword_email()
        return Response(data={"success": True, "message": "All passwords reset"}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ResetPassword(APIView):
    
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    @extend_schema(request=None,responses={200: None},description="Gets user's email, resets user's password and sends an email with the new password.")
    def post(self, request):
        try:
            email = request.data["email"]

            user = Users.objects.get(email=email)

            password = Users.objects.make_random_password()
            user.set_password(password)
            user.save()
            if (user.first_name != None and user.last_name != None):
                user_ref = user.first_name + " " + user.last_name
            else:
                user_ref = user.email

            content = {"user": user_ref, "password": password, "email": email,
                       "baseurl": request.build_absolute_uri("/")[:-1],
                       #"ellogon_logo": "https://vast.ellogon.org/static/assets/images/EllogonCyan.svg"}
                       "ellogon_logo": request.build_absolute_uri(settings.APP_LOGO)}
            reset_alert = EmailAlert(email, user_ref, content)
            reset_alert.send_resetpassword_email()
            return Response(data={
                "success": True,
                "message": "Your password reset was successful. An email with your new password will arrive shortly."}, status=status.HTTP_200_OK)
        except Exception as e:
            print("ResetPassword error:"+str(e))
            return Response(data={"success": False, "message": "Reset password error:"+str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class Me(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Returns user's data")
    def get(self, request):
        
        try:
            #print(request.build_absolute_uri('/static/assets/images/EllogonCyan.svg'))
            user = Users.objects.get(email=request.user)
            return Response(data={"success": True, "data": {"id": user.pk, "email": user.email, "permissions": user.permissions, "last_login": user.last_login,
                                                            "first_name": user.first_name, "last_name": user.last_name, "created_at": user.created_at, "updated_at": user.updated_at

                                                            }},
                            status=status.HTTP_200_OK)
        except Exception as e:
            print("Me error:"+str(e))
            return Response(data={"success": False, "message": "User info error:"+str(e)},
                            status=status.HTTP_200_OK)
   
    @extend_schema(request=None,responses={200: None},description="Updates user's firstname,lastname and email.")
    def post(self, request):
        
        try:
            user = request.user
            data = request.data
            print(request.data)
            # if we save all form info  we need to put serializer
            user.first_name = data["firstname"]
            user.username = data["email"]
            user.last_name = data["lastname"]
            user.email = data["email"]
            user.save()
            return Response(data={"success": True, "message": "Your profile was updated successfuly"},
                            status=status.HTTP_200_OK)
        except Exception as e:
            print("UpdateProfile error:"+str(e))
            return Response(data={"success": False, "message": "Your changes have not been saved"},
                            status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class UserAuthenticated(APIView):
    permission_classes = (permissions.AllowAny,)
    # authentication_classes = ()
    
    @extend_schema(request=None,responses={200: None},description="Returns whether the user is authenticated.")
    def get(self, request):
        # print("CSRF Token:", request.META["CSRF_COOKIE"], flush=True)
        # print("User Authenticated:", request.user.is_authenticated, ", Session key:", request.session.session_key, flush=True)
        user = request.user
        # print("User:", user.__dict__)
        data = {
          "success": True,
          "message": "",
          "data":    {
              "authenticated": False,
              "jwtToken": {},
              "user": {
                  "id":         getattr(user, "pk", None),
                  "first_name": getattr(user, "first_name", None),
                  "last_name":  getattr(user, "last_name", None),
                  "email":      getattr(user, "email", None),
                  "last_login": getattr(user, "last_login", None)
              }
          }
        }
        if request.user.is_authenticated:
            data["message"] = "User is authenticated."
            data["data"]["authenticated"] = True
        else:
            data["message"] = "User is not authenticated."
        return Response(data = data, status = status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ReturnStatistics(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Returns the total numbers of user's collections,documents and annotations.")   
    def get(self, request):
        annotations_counter          = 0
        collections_counter          = 0
        documents_counter            = 0
        annotations_shared_counter   = 0
        documents_shared_counter     = 0
        annotations_shared_counter   = 0
        collections_unshared_counter = 0
        documents_unshared_counter   = 0
        annotations_unshared_counter = 0
        try:
            owner = Users.objects.get(email=request.user)
            collections = Collections.objects.filter(owner_id=owner)
            documents = Documents.objects.filter(owner_id=owner)
            collections_counter = collections.count()
            documents_counter = documents.count()
            annotation_col = get_collection_handle(db_handle, "annotations")
            # Petasis, 16/03/2022: count() has been removed in mongo 5...
            # annotations = annotation_col.find({"owner_id": owner.pk})
            # annotations_counter = annotations.count(True)

            # Petasis, 21/10/2022: Filter annotations with the collections owned by the user...
            collection_ids = list(collections.values_list('id', flat=True))
            annotations_counter = annotation_col.count_documents({"owner_id": owner.pk, "collection_id": { "$in": collection_ids }})

            ## Find the collections shared with the user...
            collections_shared = SharedCollections.objects.filter(tofield=owner.email)
            collections_shared_ids = list(collections_shared.values_list('id', flat=True))
            collections_shared_counter = len(collections_shared_ids)
            documents_shared_counter   = 0
            annotations_shared_counter = annotation_col.count_documents({"owner_id": owner.pk, "collection_id": { "$in": collections_shared_ids }})

            ## Find annotations in collections no longer shared to the user...
            annotations_unshared = annotation_col.find({"owner_id": owner.pk, "collection_id": { "$nin": collections_shared_ids + collection_ids }})
            collections_unshared = set()
            documents_unshared   = set()
            for ann in annotations_unshared:
                annotations_unshared_counter += 1
                collections_unshared.add(ann.get("collection_id"))
                documents_unshared.add(ann.get("document_id"))
            collections_unshared_counter = len(collections_unshared)
            documents_unshared_counter   = len(documents_unshared)


        except Exception as ex:
            print("ReturnStatistics (get):" + str(ex))
            return Response(data={
                "success": False,
                "data": {"collections":          collections_counter,
                         "documents":            documents_counter,
                         "annotations":          annotations_counter,
                         "collections_shared":   collections_shared_counter,
                         "documents_shared":     documents_shared_counter,
                         "annotations_shared":   annotations_shared_counter,
                         "collections_unshared": collections_unshared_counter,
                         "documents_unshared":   documents_unshared_counter,
                         "annotations_unshared": annotations_unshared_counter
                         }
            }, status=status.HTTP_200_OK)
        return Response(data={"success": True,
                              "data": {"collections":          collections_counter,
                                       "documents":            documents_counter,
                                       "annotations":          annotations_counter,
                                       "collections_shared":   collections_shared_counter,
                                       "documents_shared":     documents_shared_counter,
                                       "annotations_shared":   annotations_shared_counter,
                                       "collections_unshared": collections_unshared_counter,
                                       "documents_unshared":   documents_unshared_counter,
                                       "annotations_unshared": annotations_unshared_counter
                                       }}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleCollection(APIView):
    @extend_schema(request=None,responses={200: None},operation_id="collection_data_retrieve",description="Gets collection_id and returns collection data.")
    def get(self, request, collection_id):
        try:
            collection = Collections.objects.filter(id=collection_id)
            if not collection.exists():
                return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)
            else:
                c = collection.get()
                data = [{
                    "id": c.pk,
                    "name": c.name,
                    "owner_id": (c.owner_id).pk,
                    "encoding": c.encoding,
                    "handler": c.handler,
                    "created_at": c.created_at,
                    "updated_at": c.updated_at
                }]
                return Response(data={"success": True, "data": data}, status=status.HTTP_200_OK)
        except Exception as ex:
            print("HandleCollection (get):" + str(ex))
            return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=None,responses={200: None},description="Gets collection_id and deletes collection data along with its documents and their annotations.")
    def delete(self, request, collection_id):
        try:
            collection = Collections.objects.filter(id=collection_id)
            if not collection.exists():
               # print("HandleCollection (delete): Wrong collection id")
                return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)
            annotations = get_collection_handle(db_handle, "annotations")
            annotations_temp = get_collection_handle(
                db_handle, "annotations_temp")
            documents = Documents.objects.filter(
                collection_id=collection.get())
        except Exception as ex:
            print("HandleCollection (delete):" + str(ex))
            return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)
        for document in documents:
            annotations.delete_many({"document_id": document.pk})
            annotations_temp.delete_many({"document_id": document.pk})
        collection.delete()
        return Response(data={"success": True}, status=status.HTTP_200_OK)
    
    
    @extend_schema(request=None,responses={200: None},description="Gets collection_id and renames collection.")
    def patch(self, request, collection_id):
        try:
            collection = Collections.objects.filter(id=collection_id)
            if not collection.exists():
                return Response(data={"success": False, "exists": False, "flash": "An error occured!"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as ex:
            print("HandleCollection (patch1):" + str(ex))
            return Response(data={"success": False, "exists": False, "flash": "An error occured!"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = Users.objects.get(email=request.user)
            collection_queryset = Collections.objects.filter(
                name=request.data["data"]["name"], owner_id=user)

            if(collection_queryset.exists()):
                return Response(data={"success": True, "exists": True,
                                      "flash": "The name you selected already exists. Please select a new name"},
                                status=status.HTTP_200_OK)

            serializer = CollectionsSerializer(
                collection.get(), data={"name": request.data["data"]["name"],"updated_at":datetime.now()}, partial=True)
            if serializer.is_valid():
                project = serializer.save()
                return Response(data={"success": True, "exists": False}, status=status.HTTP_200_OK)
        except Exception as ex:
            print("HandleCollection (patch2):" + str(ex))
            return Response(data={"success": True, "exists": True, "flash": "An error occured!"}, status=status.HTTP_200_OK)


# 4 & 5
@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleCollections(APIView):
    @extend_schema(request=None,responses={200: None},description="Returns  all data for the collections that user has access.")   
    def get(self, request):
        
        collection_data = {}
        collections_lst = []
        try:
            owner = Users.objects.get(email=request.user)
            collections = Collections.objects.filter(owner_id=owner)

            myshared_collections = SharedCollections.objects.filter(
                fromfield=owner)
            shared_collections = SharedCollections.objects.filter(
                tofield=owner)
            print(shared_collections)
        except Exception as ex:
            print("HandleCollections (GET):" + str(ex))
            return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)
        for collection in collections:
            collection_data["id"] = collection.pk
            collection_data["name"] = collection.name
            collection_data["handler"] = collection.handler
            collection_data["encoding"] = collection.encoding
            collection_data["owner_id"] = (collection.owner_id).pk
            confirmed = None

            sc = myshared_collections.filter(collection_id=collection)
            if (sc.exists()):
                confirmed = 0
                for scitem in sc:
                    if (scitem.confirmed == 1):
                        confirmed = 1
            else:
                confirmed = None

            collection_data["confirmed"] = confirmed
            collection_data["is_owner"] = 1
            documents = Documents.objects.filter(collection_id=collection)
            collection_data["document_count"] = documents.count()
            collections_lst.append(collection_data)
            collection_data = {}
        for tsc in shared_collections:
            if(tsc.confirmed == 0):
                continue
            c1 = Collections.objects.get(pk=tsc.collection_id.pk)
            collection_data["id"] = c1.pk
            collection_data["name"] = c1.name
            collection_data["handler"] = c1.handler
            collection_data["encoding"] = c1.encoding
            collection_data["owner_id"] = (c1.owner_id).pk
            collection_data["confirmed"] = 1
            collection_data["is_owner"] = 0
            documents = Documents.objects.filter(collection_id=c1)
            collection_data["document_count"] = documents.count()
            collections_lst.append(collection_data)
            collection_data = {}
        return Response(data={"success": True, "data": collections_lst}, status=status.HTTP_200_OK)

    @extend_schema(request=None,responses={200: None},description="Gets data (name,encoding,handler,type) for creating  a collection along with a set of documents.")   
    def post(self, request):
        
        new_data = {}
        try:
            data = request.data["data"]
            owner = Users.objects.get(email=request.user)
        except Exception as ex:
            print("HandleCollections (POST):" + str(ex))
            return Response(data={"success": False, "message": str(ex)}, status=status.HTTP_400_BAD_REQUEST)

        collection = Collections.objects.filter(
            owner_id=owner, name=data["name"])
        if(collection.exists() and data["overwrite"] == False):
            return Response(data={"success": True, "exists": True, "collection_id": collection.get().pk}, status=status.HTTP_200_OK)
        if (collection.exists() and data["overwrite"] == True):
            c1 = collection.get()
            docs = Documents.objects.filter(collection_id=c1)
            for doc in docs:
                doc.delete()
            return Response(data={"success": True, "exists": True, "collection_id": collection.get().pk, "overwrite": True},
                            status=status.HTTP_200_OK)
        new_data["name"] = data["name"]
        new_data["encoding"] = data["encoding"]
        new_data["handler"] = "none"
        if (isinstance(data["handler"], str) == True):
            new_data["handler"] = data["handler"]
        else:
            if (isinstance(data["handler"], dict) == True and "value" in data["handler"].keys()):

                new_data["handler"] = data["handler"]["value"]
            else:
                new_data["handler"] = None

        if ("created_at" in data):
            new_data["created_at"] = transformdate(data["created_at"])
        if ("updated_at" in data):
            new_data["updated_at"] = transformdate(data["updated_at"])

        new_data["owner_id"] = owner.pk

        serializer = CollectionsSerializer(data=new_data)
        if serializer.is_valid():
            collection = serializer.save()
            return Response(data={"success": True, "collection_id": collection.pk, "exists": False})

        return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ExistCollection(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Checks if  there is collection with the given name.")   
    def get(self, request, collection_name):
        try:
            owner = Users.objects.get(email=request.user)
            duplicateCollection = Collections.objects.filter(
                owner_id=owner, name=collection_name)
            if (duplicateCollection.exists()):
                duplicateCollectionInstance = duplicateCollection.get()
                return Response(data={"success": True, "exists": True, "flash": "The name you selected already exists. Please select a new name", "data": {"name": duplicateCollectionInstance.name, "id": duplicateCollectionInstance.pk,
                                                                                                                                                           "encoding": duplicateCollectionInstance.encoding, "handler": duplicateCollectionInstance.handler, "created_at": duplicateCollectionInstance.created_at,
                                                                                                                                                           "updated_at": duplicateCollectionInstance.updated_at, "owner_id": duplicateCollectionInstance.owner_id.pk

                                                                                                                                                           }},
                                status=status.HTTP_200_OK)
            else:
                return Response(data={"success": True, "exists": False})
        except Exception as ex:
            print("ExistCollection:"+str(ex))
            return Response(data={"success": False, "message": str(ex)}, status=status.HTTP_200_OK)


# 6 & 7

def DocumentLiveUpdate_event_stream(request, collection_id, document_id):
    elapsed_time = 0
    started_time = datetime.now() - timedelta(seconds=7)
    new_annotations = []
    cid = int(collection_id)
    did = int(document_id)
    # Get a Collection object (model)
    collection = Collections.objects.get(pk=cid)
    annotations = get_collection_handle(db_handle, "annotations_temp")
    #is_shared_query = SharedCollections.objects.filter(collection_id_id=cid,tofield_id=request.user.email)
    is_owner = True if collection.owner_id.id == request.user.id else False
    is_shared = False
    # request.user holds the current user!
    count = 0
    while True:
        # If connection aborted, break!
        if elapsed_time > 20:
            return

        if (is_owner == False):
            start_time = time.process_time()
            #is_shared = (is_shared_query).exists()
            with connection.cursor() as cursor:
                is_shared = cursor.execute(
                    "SELECT COUNT(*) FROM `shared_collections` WHERE collection_id_id = %s AND tofield_id = %s", [cid, request.user.email])
            #print("SharedCollections.objects.filter:", 1000 * (time.process_time() - start_time))
            # print(q.explain())
            #print("Q:", q.query)
            #start_time = time.process_time()
            # is_shared=(q).exists()
            # print("SharedCollections.objects.filter.exists():",
            #       1000 * (time.process_time() - start_time))
        # print(f"status: {is_owner} | {is_shared}")

        yield "event: message\n"
        started_time_new = datetime.now()
        if is_owner or is_shared:
            # Get Annotations from TEMP where('updated_at', '>=', started_time)
            new_annotations = []
            getfilter = {"collection_id": cid, "document_id": did,
                         'updated_at': {'$gte': started_time}}
            start_time = time.process_time()
            getquery = annotations.find(getfilter)
            #print("annotations.find:", 1000 *
            #      (time.process_time() - start_time))
            # Get Annotations from TEMP where('updated_at', '>=', started_time)

            for item in getquery:
                item["_id"] = str(item["_id"])
                #     print(item["updated_at"])
                #     print(started_time)
                new_annotations.append(item)
        else:
            new_annotations = []
        # print(f"SENDING: {request.user.email} {count} ({elapsed_time}) => {len(new_annotations)}")
        if len(new_annotations):
            started_time = started_time_new
            elapsed_time = 0
            yield "data: " + json.dumps((new_annotations), default=defaultconverter) + "\n"
        else:
            elapsed_time += 4
            yield "data: " + json.dumps(new_annotations) + "\n"
            time.sleep(3)
        count += 1
        yield f"id: {uniqid()}\n\n"
        time.sleep(1)


# @condition(etag_func=None)
@method_decorator(ensure_csrf_cookie, name='dispatch')
class DocumentLiveUpdate(APIView):
    @extend_schema(request=None,responses={200: None},description="Get document changes in real time for annotation tool web  application.")   
    def get(self, request, collection_id, document_id):
        # print("DocumentLiveUpdate:", request, collection_id, document_id, request.user.is_authenticated)
        # print("User:", request.user, dir(request.user));
        if not request.user.is_authenticated:
            return Response("", status=403)
        response = StreamingHttpResponse(DocumentLiveUpdate_event_stream(request, collection_id, document_id),
                                         status=200, content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['connection'] = 'keep-alive'
        return response


class HandlerApply(APIView):
    
    authentication_classes = []
    permission_classes = []

    @extend_schema(request=None,responses={200: None},description="Applies handler for tei xml files.")   
    def post(self, request, format='json'):
        try:
            data = request.data
            binary_file = data.get("binary_file")
            type = data.get("type")
        except Exception as e:
            print("HandlerApply:"+"field_not_exist")
            return Response({"error": "field_not_exist"}, status=status.HTTP_400_BAD_REQUEST)
        # print(data)

        if (type == "tei"):
            handler = HandlerClass(binary_file, type)
            json = handler.apply()
            return Response(json, status=status.HTTP_200_OK)
        else:
            print("HandlerApply:"+"handler_not_exist")
            return Response({"error": "handler_not_exist"}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ShareCollectionView(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Gets collection name, collection id and the email of the invited user and sends an email with an invitation for sharing the collection.")   
    def post(self, request, collection_id):

        try:
            data = request.data["data"]
            fromuser = Users.objects.get(email=request.user)
            touser = Users.objects.get(email=data["to"])
            collection = (Collections.objects.filter(
                pk=data["cid"], name=data["cname"])).get()
            sharecollection = SharedCollections.objects.filter(
                collection_id=collection, fromfield=fromuser, tofield=touser)
        except Exception as e:
            print("ShareCollectionView(post):"+str(e))
            return Response(data={"success": False, "message": "An error occured: "+str(e)+" Invitation email has not been sent"},
                            status=status.HTTP_200_OK)
        if fromuser.pk == touser.pk:
            return Response(data={"success": False, "message": "You cannot share a collection with yourself."},
                            status=status.HTTP_200_OK)

        if sharecollection.exists():
            return Response(
                data={
                    "success": False, "message": "You have already shared this collection to the user."},
                status=status.HTTP_200_OK)
        uidb64 = urlsafe_base64_encode(force_bytes(fromuser.pk))
        usidb64 = urlsafe_base64_encode(force_bytes(touser.pk))
        upidb64 = urlsafe_base64_encode(force_bytes(collection_id))
        invitation_token.make_my_hash_value(touser.pk, collection_id)
        token = invitation_token.make_token(fromuser)
        link = reverse('api_collection_share_verify',
                       kwargs={'uidb64': uidb64, "usidb64": usidb64, "upidb64": upidb64, "collection_id": collection_id, 'token': token})
        invitation_link = request.build_absolute_uri(link)
        confirmation_code = uidb64 + "/" + usidb64 + "/" + upidb64 + "/" + token
        data = {"confirmed": 0, "confirmation_code": confirmation_code, "collection_id": collection.pk,
                "fromfield": fromuser.email, "tofield": touser.email}
        serializer = SharedCollectionsSerializer(data=data)
        if serializer.is_valid():
            shared_collection = serializer.save()
            content = {"user": touser.first_name, "link": invitation_link, "owner": fromuser.first_name,
                       "collection": collection.name, "email": touser.email,
                       "baseurl": request.build_absolute_uri("/")[:-1],
                       "ellogon_logo": request.build_absolute_uri(settings.APP_LOGO)}
                       #"ellogon_logo": "https://vast.ellogon.org/images/logo.jpg"}
            # "ellogon_logo": request.build_absolute_uri('/static/images/EllogonLogo.svg')}
            invitation_alert = EmailAlert(
                touser.email, touser.first_name, content)
            invitation_alert.send_sharecollection_email()
            return Response(data={"success": True}, status=status.HTTP_200_OK)
        print("ShareCollectionView(post):"+str(serializer.errors))
        return Response(data={"success": False, "message": "An error occured: Invitation email has not been sent."},
                        status=status.HTTP_200_OK)

    @extend_schema(request=None,responses={200: None},description="Gets collection id and returns all the users that are invited to share the collection.")   
    def get(self, request, collection_id):
    
        collection = Collections.objects.get(pk=collection_id)
        user = Users.objects.get(email=request.user)
        sharecollections = SharedCollections.objects.filter(
            collection_id=collection, fromfield=user)
        records = []
        for item in sharecollections:
            records.append(
                {"id": item.pk, "collection_id": (item.collection_id).pk, "to": (item.tofield).email, "confirmed": item.confirmed})
        return Response(data={"success": True, "data": records}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class SharedCollectionDelete(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Gets collection id and shared id and revokes the selected invitation.")   
    def delete(self, request, collection_id, share_id):
        
        try:
            sharecollection = SharedCollections.objects.get(pk=share_id)
            touser=sharecollection.tofield
            opendocuments=OpenDocuments.objects.filter(collection_id_id=int(collection_id),user_id=touser)
            for opendocument in opendocuments:
                opendocument.delete()
            sharecollection.delete()
            return Response(data={"success": True}, status=status.HTTP_200_OK)
        except Exception as e:
            print("SharedCollectionDelete(delete)"+str(e))
            return Response(data={"success": False,"message":"SharedCollectionDelete(delete)"+str(e)}, status=status.HTTP_200_OK) 

@method_decorator(ensure_csrf_cookie, name='dispatch')
class AcceptCollectionView(View):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request, collection_id, uidb64, usidb64, upidb64, token):
        baseurl = request.build_absolute_uri('/')
        if "http://127.0.0.1:8000/" in baseurl:
            baseurl = "https://localhost:4200/"
        try:
            id = force_str(urlsafe_base64_decode(uidb64))
            ids = force_str(urlsafe_base64_decode(usidb64))
            idp = force_str(urlsafe_base64_decode(upidb64))
            owner = Users.objects.get(pk=id)
            shared_user = Users.objects.get(pk=ids)
            collection = Collections.objects.get(pk=idp)
            shared_collection = (
                SharedCollections.objects.filter(collection_id=collection, fromfield=owner, tofield=shared_user)).get()
        except Exception as e:
            print("AcceptCollectionView(get)"+str(e))
            message = {"message": "The requested invitation does not exist!","ellogon_logo": request.build_absolute_uri(settings.APP_LOGO),
                       "base_url": baseurl+"auth/login"}
            template = loader.get_template('activateview.html')
            return HttpResponse(template.render(message, request))
        confirmed = shared_collection.confirmed
        if (confirmed == False):
            shared_collection.confirmed = True
            shared_collection.save()
            message = {
                "message": "You have successfully accepted the invitation! Start the annotation!", "base_url": baseurl+"auth/login","ellogon_logo": request.build_absolute_uri(settings.APP_LOGO)}
            template = loader.get_template('activateview.html')
            return HttpResponse(template.render(message, request))
        message = {
            "message": "The requested invitation has already been accepted!", "base_url": baseurl+"auth/login","ellogon_logo": request.build_absolute_uri(settings.APP_LOGO)}
        template = loader.get_template('activateview.html')

        return HttpResponse(template.render(message, request))


@method_decorator(ensure_csrf_cookie, name='dispatch')
class OpenDocumentView(APIView):
    
    @extend_schema(request=None,responses={200: None},operation_id="opendocument_view",description="Returns collection id, document id, annotator type, db_interactions, opened, confirmed and user id for all open documents.")   
    def get(self, request):
        
        try:
            user = Users.objects.get(email=request.user)
            opendocuments = OpenDocuments.objects.all()
            records = []
            for opendocument in opendocuments:
                collection = Collections.objects.get(
                    pk=(opendocument.collection_id).pk)

                if((opendocument.user_id).pk == user.pk):
                    opened = 1

                else:
                    opened = 0
                shared_collection_queryset = (
                    SharedCollections.objects.filter(collection_id=collection))
                shared_count = 0
                confirmed_lst = []
                confirmed = None
                for shared_collection in shared_collection_queryset:
                    confirmed = 0
                    if (shared_collection.confirmed == 1):
                        confirmed = 1
                        break
                records.append({"collection_id": (opendocument.collection_id).pk,
                                "document_id": (opendocument.document_id).pk,
                                "annotator_type": opendocument.annotator_type,
                                "db_interactions": opendocument.db_interactions,
                                "opened": opened, "confirmed": confirmed,
                                "user_id": (opendocument.user_id).pk
                                })
        except Exception as e:
            print("OpenDocumentView (get):"+str(e))
            return Response(data={"success": False, "data": []}, status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": records}, status=status.HTTP_200_OK)

    @extend_schema(request=None,responses={200: None},description="Gets collection id, document id and annotator type and creates a new open document.")   
    def post(self, request):
        
        try:
            data = request.data["data"]
            collection = Collections.objects.get(pk=data["collection_id"])
            document = Documents.objects.get(pk=data["document_id"])
            user = Users.objects.get(email=request.user)
            opendocument = OpenDocuments.objects.filter(
                user_id=user.pk, collection_id=collection, document_id=document)
            data = {"annotator_type": data["annotator_type"], "user_id": user.pk,
                    "collection_id": collection.pk, "document_id": document.pk, "db_interactions": 0,
                    "updated_at": datetime.now()}
            if (not (opendocument.exists())):
                serializer = OpenDocumentsSerializer(data=data)
                if serializer.is_valid():
                    opendocument = serializer.save()
            else:
                serializer = OpenDocumentsSerializer(
                    opendocument.get(), data=data, partial=True)

            return Response(data={"success": True, "data": {"annotator_type": data["annotator_type"], "collection_id": collection.pk, "document_id": document.pk}})

        except Exception as ex:
            print("OpenDocumentView (post):" + str(ex))
            return Response(data={"success": False, "message": "An error occured!"},
                            status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CollectionDataView(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Returns document id, document name, collection id, collection name, owner id, confirmed and is owner for all the documents that user has access.")   
    def get(self, request):
        
        try:
            user = Users.objects.get(email=request.user)
            collections = Collections.objects.filter(owner_id=user)
            shared_collections = SharedCollections.objects.filter(
                fromfield=user)
            doc_records = []
            confirmed = None

            for collection in collections:
                myshared_collection = shared_collections.filter(
                    collection_id=collection)
                if (myshared_collection.exists()):
                    confirmed = 0
                    for scitem in myshared_collection:
                        if (scitem.confirmed == 1):
                            confirmed = 1
                documents = Documents.objects.filter(
                    collection_id=collection, owner_id=user)
                for document in documents:
                    doc_records.append({"id": document.pk, "name": document.name, "collection_id": collection.pk,
                                        "collection_name": collection.name,
                                        "owner_id": (document.owner_id).pk,
                                        "confirmed": confirmed, "is_owner": 1})
                confirmed = None

            shared_collections = SharedCollections.objects.filter(
                tofield=user, confirmed=1)

            for shared_collection in shared_collections:
                collection = Collections.objects.get(
                    pk=(shared_collection.collection_id).pk)

                documents = Documents.objects.filter(collection_id=collection)
                for document in documents:
                    doc_records.append({"id": document.pk, "name": document.name, "collection_id": collection.pk,
                                        "collection_name": collection.name,
                                        "owner_id": (document.owner_id).pk,
                                        "confirmed": 1, "is_owner": 0})
        except Exception as ex:
            print("CollectionDataView (get):" + str(ex))
            return Response(data={"success": False, "message": "An error occured!"},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": doc_records}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ButtonAnnotatorView(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Gets most recent selected button annotation schema.")   
    def get(self, request):

        try:
            user = Users.objects.get(email=request.user)
            button_annotator_query=ButtonAnnotators.objects.filter(user_id=user)
            if (button_annotator_query.exists()):
                button_annotator =button_annotator_query.get() 
                btn_data = {"language": button_annotator.language, "annotation_type": button_annotator.annotation_type,
                        "attribute": button_annotator.attribute, "alternative": button_annotator.alternative}
            else:
                btn_data={}    
        except Exception as ex:
            print("ButtonAnnotatorView (get):" + str(ex))
            return Response(data={"success": True, "data": None},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": btn_data}, status=status.HTTP_200_OK)

    @extend_schema(request=None,responses={200: None},description="Stores the user's most recent selection of button annotation schema.")   
    def post(self, request):
        
        try:
            user = Users.objects.get(email=request.user)
            button_annotator = ButtonAnnotators.objects.filter(user_id=user)
            data = {"language": request.data["data"]["language"], "annotation_type": request.data["data"]["annotation_type"],
                    "attribute": request.data["data"]["attribute"], "alternative": request.data["data"]["alternative"],
                    "updated_at": datetime.now()}
            if (not (button_annotator.exists())):
                data["user_id"] = user.pk
                serializer = ButtonAnnotatorsSerializer(data=data)
                if serializer.is_valid():
                    btn_annotator = serializer.save()
            else:
                serializer = ButtonAnnotatorsSerializer(
                    button_annotator.get(), data=data, partial=True)
                if serializer.is_valid():
                    btn_annotator = serializer.save()

            return Response(data={"success": True})

        except Exception as ex:
            print("ButtonAnnotatorView (post):" + str(ex))
            return Response(data={"success": False, "message": "An error occured!"},
                            status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CoreferenceAnnotatorView(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Gets most recent selected coreference annotation schema.")   
    def get(self, request):

        try:
            user = Users.objects.get(email=request.user)
            coreference_annotator_query=CoreferenceAnnotators.objects.filter(user_id=user)
            if (coreference_annotator_query.exists()):
                coreference_annotator =coreference_annotator_query.get() 
                coref_data = {"language": coreference_annotator.language,
                          "annotation_type": coreference_annotator.annotation_type,
                          "alternative": coreference_annotator.alternative}
            else:
                coref_data={}    
        except Exception as ex:
            print("CoreferenceAnnotatorView (get):" + str(ex))
            return Response(data={"success": False, "message": "An error occured: " + str(ex)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": coref_data}, status=status.HTTP_200_OK)

    @extend_schema(request=None,responses={200: None},description="Stores the user's most recent selection of coreference annotation schema.")   
    def post(self, request):
        
        try:
            user = Users.objects.get(email=request.user)
            coreference_annotator = CoreferenceAnnotators.objects.filter(
                user_id=user)
            data = {"language": request.data["data"]["language"], "annotation_type": request.data["data"]["annotation_type"],
                    "alternative": request.data["data"]["alternative"],
                    "updated_at": datetime.now()}
            if not (coreference_annotator.exists()):
                data["user_id"] = user.pk
                serializer = CoreferenceAnnotatorsSerializer(data=data)
                if serializer.is_valid():
                    coref_annotator = serializer.save()
            else:
                serializer = CoreferenceAnnotatorsSerializer(coreference_annotator.get(), data=data, partial=True)
                if serializer.is_valid():
                    coref_annotator = serializer.save()
            return Response(data={"success": True})
        except Exception as ex:
            print("CoreferenceAnnotatorView (post):" + str(ex))
            return Response(data={"success": False, "message": "An error occured: " + str(ex)},
                            status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class OpenDocumentRetrieve(APIView):
    
    @extend_schema(request=None,responses={200: None},description="Returns all open documents with the given document id.")   
    def get(self, request, document_id):
        data = []
        try:
            user = Users.objects.get(email=request.user)
            document = Documents.objects.get(pk=document_id)
            owner_id = (document.owner_id).pk

            opendocument_queryset = OpenDocuments.objects.filter(
                document_id=document)
            for opendocument in opendocument_queryset:
                opened = 0
                owner = 0
                if ((opendocument.user_id).pk == user.pk):
                    opened = 1

                if ((opendocument.user_id).pk == owner_id):
                    owner = 1
                record = {"collection_id": (opendocument.collection_id).pk, "document_id": (opendocument.document_id).pk, "annotator_type": opendocument.annotator_type,
                          "db_interactions": opendocument.db_interactions, "confirmed": None, "opened": opened, "user_id": (opendocument.user_id).pk, "first_name": (opendocument.user_id).first_name,
                          "last_name": (opendocument.user_id).last_name, "email": (opendocument.user_id).email, "owner": owner}
                sharedcollectionset = SharedCollections.objects.filter(
                    collection_id=opendocument.collection_id)
                for sharedcollection in sharedcollectionset:
                    record["confirmed"] = sharedcollection.confirmed
                    if (sharedcollection.confirmed == 1):
                        break
                data.append(record)

        except Exception as ex:
            print("OpenDocumentRetrieve (get):" + str(ex))
            return Response(data={"success": True, "data": data}, status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": data}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class OpenDocumentUpdate(APIView):
    
    @extend_schema(request=None,responses={200: None}, operation_id="open_document_update",description="Gets document id and button annotator name and returns collection id, document id, db interactions, annotator type, confirmed, opened.<br>Resets db interactions and updates updated_at with current timestamp.")   
    def get(self, request, document_id, Button_Annotator_name):
        data = []
        try:
            user = Users.objects.get(email=request.user)
            document = Documents.objects.get(pk=document_id)
            opendocument_queryset = OpenDocuments.objects.filter(
                user_id=user, document_id=document)
            opendocument = opendocument_queryset.get()
            collection_id = (opendocument.collection_id).pk
            shared_collections = SharedCollections.objects.filter(
                collection_id=(opendocument.collection_id).pk)  # ?
            confirmed = None

            for shared_collection in shared_collections:

                if((shared_collection.fromfield).pk == user.pk):
                    confirmed = shared_collection.confirmed
                    break
                if ((shared_collection.tofield).pk == user.pk):

                    confirmed = shared_collection.confirmed
                    break

            data.append({"collection_id": collection_id, "document_id": int(document_id), "db_interactions": opendocument.db_interactions,
                         "annotator_type": Button_Annotator_name, "confirmed": confirmed, "opened": 1})
            opendocument.db_interactions = 0
            opendocument.updated_at = datetime.now()
            opendocument.save()
        except Exception as ex:
            print("OpenDocumentUpdate (get):" + str(ex))
            return Response(data={"success": True, "data": data},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": data},
                        status=status.HTTP_200_OK)

    @extend_schema(request=None,responses={200: None},description="Gets document id and button annotator name and deletes the open document.")   
    def delete(self, request, document_id, Button_Annotator_name):
        
        try:
            user = Users.objects.get(email=request.user)
            document = Documents.objects.get(pk=document_id)
            opendocument_queryset = OpenDocuments.objects.filter(
                user_id=user, document_id=document, annotator_type=Button_Annotator_name)
            opendocument = opendocument_queryset.get()
            opendocument.delete()
            return Response(data={"success": True, "message": "open document deleted"}, status=status.HTTP_200_OK)
        except Exception as ex:
            print("OpenDocumentUpdate (delete):" + str(ex))
            return Response(data={"success": False, "message": "An error occured!"},
                            status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ImportView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    @extend_schema(request=None,responses={200: None},description="Not implemented.")   
    def post(self, request):
        return Response(data={"message": "This functionality is not implemented"}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ImportAnnotationsView(APIView):

    @extend_schema(request=None,responses={200: None},description="Gets collection id, document id and a list with annotations and imports them to the current document.")   
    def post(self, request, collection_id, document_id):

        annotations = request.data["data"]
        if (isinstance(annotations, list) == True):
            if (len(annotations) >= 0):
                col_annotations = get_collection_handle(
                    db_handle, "annotations")
                exclude_keys = ['_id', 'collection_id', 'document_id']
                for item in annotations:
                    new_item = {k: item[k] for k in set(
                        list(item.keys())) - set(exclude_keys)}
                    new_item['collection_id'] = int(collection_id)
                    new_item["document_id"] = int(document_id)
                    new_item['created_at'] = transformdate(item["created_at"])
                    new_item["updated_at"] = transformdate(item["updated_at"])
                    col_annotations.insert_one(new_item)
                return Response(data={"success": True}, status=status.HTTP_200_OK)
        else:
            if (isinstance(annotations, dict) == True):

                col_annotations = get_collection_handle(
                    db_handle, "annotations")
                exclude_keys = ['_id']
                ann = annotations
                new_ann = {k: ann[k] for k in set(
                    list(ann.keys())) - set(exclude_keys)}
                new_ann['created_at'] = transformdate(new_ann["created_at"])
                new_ann["updated_at"] = transformdate(new_ann["updated_at"])
                # print(new_ann)
                if (new_ann["type"] != "setting annotation"):
                    col_annotations.insert_one(new_ann)
                return Response(data={"success": True}, status=status.HTTP_200_OK)
        return Response(data={"success": False, "message": "Invalid Annotations"}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ExportCollectionView(APIView):

    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    @extend_schema(request=None,responses={200: None},description="Gets collection id and exports the collection along with its documents and their annotations.")   
    def get(self, request, collection_id):
        data = {}
        try:
            collection = Collections.objects.get(pk=collection_id)
            annotations = get_collection_handle(db_handle, "annotations")
            for attr, value in collection.__dict__.items():
                if not attr == "_state":
                    if (attr == "owner_id_id"):
                        attr = "owner_id"
                    data[attr] = value
            documents = Documents.objects.filter(collection_id=collection)
            doc_records = []
            doc_record = {}
            document_annotations = []
            exclude_keys = ["_state", "owner_id_id", "collection_id_id"]
            for document in documents:

                for attr, value in document.__dict__.items():
                    if not (attr in exclude_keys):
                        doc_record[attr] = value
                annotation_cur = annotations.find({"document_id": document.pk})
                for annotation in annotation_cur:
                    annotation["_id"] = str(annotation["_id"])
                    document_annotations.append(annotation)
                doc_record["annotations"] = document_annotations
                doc_records.append(doc_record)
                document_annotations = []
                doc_record = {}
            data["documents"] = doc_records
        except Exception as ex:
            print("ExportCollectionView (get):" + str(ex))
            return JsonResponse(data={"success": True, "message": "An error occured: " + str(ex)},
                                status=status.HTTP_200_OK)
        response = JsonResponse(data={"success": True, "message": "ok", "data": data},
                            status=status.HTTP_200_OK)
        response['Content-Disposition'] = f'attachment; filename="{collection.name}.json"'
        return response


def defaultconverter(o):
    if isinstance(o, datetime):
        return o.__str__()


def str2date(strdate):
    try:
        dt_tuple = tuple([int(x) for x in strdate[:10].split('-')]) + \
            tuple([int(x) for x in strdate[11:].split(':')])
        # print(dt_tuple)
        datetimeobj = datetime(*dt_tuple)
    except Exception as e:
        datetimeobj = datetime.now()
    return datetimeobj


def transformdate(datetime_str):
    if ("." not in datetime_str):
        datetime_str = datetime_str+".000000"

    datetime_parts = datetime_str.split("T")
    # print(datetime_parts)
    date_segment = datetime_parts[0]
    time_segment = (
        (datetime_parts[1][0:len(datetime_parts[1])-1]).split("."))[0]
    # print(date_segment)
    # print(time_segment)
    date_parts = date_segment.split("-")
    date_parts[0] = int(date_parts[0])
    for i in range(1, len(date_parts)):
        if (date_parts[i][0] == "0"):
            date_parts[i] = date_parts[i][1:]
        date_parts[i] = int(date_parts[i])

    time_parts = time_segment.split(":")
    for i in range(0, len(time_parts)):
        if (time_parts[i][0] == "0"):
            time_parts[i] = time_parts[i][1:]
        if (time_parts[i][-1] == "Z"):
            time_parts[i] = int(time_parts[i][0:len(time_parts[i])-1])
        else:
            time_parts[i] = int(time_parts[i])
    # print(date_parts)
    # print(time_parts)
    output_datetime = datetime(date_parts[0], date_parts[1], date_parts[2], time_parts[0], time_parts[1],
                               time_parts[2])
    return output_datetime
    #  cwd = os.getcwd()


@method_decorator(ensure_csrf_cookie, name='dispatch')
class MainView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request):
        # connect clarin_annotations db
        cnx = mysql.connector.connect(user='clarinel', password='FaRXgxC2mpVYhmqj',
                                      port=3306, host='127.0.0.1', database='clarin_annotations')
        # print(cnx)
        if (cnx.is_connected()):
            print("Connected")
        else:
            print("Not connected")

        # get all data
        cur = cnx.cursor()

        dbtables = ["users", "collections", "documents", "open_documents",
                    "button_annotators", "coreference_annotators", "shared_collections"]
        for dbtable in dbtables:
            print(dbtable)
            query = "SELECT * FROM " + dbtable
            cur.execute(query)
            res = cur.fetchall()
            if (dbtable == "users"):
                Users.objects.all().delete()
                for x in res:
                    if (x[7] is not None):
                        if (x[8] is not None):
                            user = Users(pk=x[0], username=x[1], email=x[1], password="clarinbcrypt_sha256$"+x[2], permissions=x[3], last_login=x[4],
                                         first_name=x[5], last_name=x[6], created_at=x[7], updated_at=x[8])
                        else:
                            user = Users(pk=x[0], username=x[1], email=x[1], password="clarinbcrypt_sha256$"+x[2], permissions=x[3], last_login=x[4],
                                         first_name=x[5], last_name=x[6], created_at=x[7])
                    else:
                        if (x[8] is not None):
                            user = Users(pk=x[0], username=x[1], email=x[1], password="clarinbcrypt_sha256$"+x[2], permissions=x[3], last_login=x[4],
                                         first_name=x[5], last_name=x[6], updated_at=x[8])
                        else:
                            user = Users(pk=x[0], username=x[1], email=x[1], password="clarinbcrypt_sha256$"+x[2], permissions=x[3], last_login=x[4],
                                         first_name=x[5], last_name=x[6])

                    user.save()
                continue

            if (dbtable == "collections"):
                Collections.objects.all().delete()
                for x in res:
                    user = Users.objects.get(pk=x[2])
                    collection = Collections(
                        pk=x[0], name=x[1], owner_id=user, encoding=x[3], handler=x[4], created_at=x[5], updated_at=x[6])

                    collection.save()
                continue

            if (dbtable == "documents"):
                Documents.objects.all().delete()
                for x in res:
                    user = Users.objects.get(pk=x[12])
                    collection = Collections.objects.get(pk=x[13])
                    document = Documents(pk=x[0], name=x[1], type=x[2], text=x[3], data_text=x[4], data_binary=x[5], handler=x[6], visualisation_options=x[7], metadata=x[8],
                                         external_name=x[9], encoding=x[10], version=x[11], owner_id=user, collection_id=collection, updated_by=x[14], created_at=x[15], updated_at=x[16])
                    document.save()
                continue

            if (dbtable == "open_documents"):
                OpenDocuments.objects.all().delete()
                for x in res:
                    collection = Collections.objects.get(pk=x[1])
                    document = Documents.objects.get(pk=x[2])
                    user = Users.objects.get(pk=x[0])
                    open_document = OpenDocuments(user_id=user, collection_id=collection, document_id=document,
                                                  annotator_type=x[3], db_interactions=x[4], created_at=x[5], updated_at=x[6], pk=x[7])
                    open_document.save()
                continue

            if (dbtable == "button_annotators"):
                ButtonAnnotators.objects.all().delete()
                for x in res:
                    user = Users.objects.get(pk=x[0])
                    button_annotator = ButtonAnnotators(
                        user_id=user, language=x[1], annotation_type=x[2], attribute=x[3], alternative=x[4], created_at=x[5], updated_at=x[6])
                    button_annotator.save()
                continue
            if (dbtable == "coreference_annotators"):
                CoreferenceAnnotators.objects.all().delete()
                for x in res:
                    user = Users.objects.get(pk=x[0])
                    coreference_annotator = CoreferenceAnnotators(
                        user_id=user, language=x[1], annotation_type=x[2], alternative=x[3], created_at=x[4], updated_at=x[5])
                    coreference_annotator.save()
                continue
            if (dbtable == "shared_collections"):
                SharedCollections.objects.all().delete()
                for x in res:
                    fuser = Users.objects.get(email=x[2])
                    tuser = Users.objects.get(email=x[3])
                    collection = Collections.objects.get(pk=x[1])
                    shared_collection = SharedCollections(pk=x[0], collection_id=collection, fromfield=fuser, tofield=tuser, confirmation_code=x[4], confirmed=x[5], created_at=x[6],
                                                          updated_at=x[7])
                    shared_collection.save()
                continue

        return Response(data={"Data import": "sucess"}, status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class TestEmailSendView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, format='json'):
        content = {"user": "Test User", "link": "https://vast.ellogon.org",
                   "email": request.data['email'],
                   "baseurl": request.build_absolute_uri("/")[:-1],
                   "ellogon_logo": request.build_absolute_uri(settings.APP_LOGO)}
                   #"ellogon_logo": "https://vast.ellogon.org/images/logo.jpg"}
        activation_alert = EmailAlert(content['email'], content['user'], content)
        activation_alert.send_activation_email()
        return Response({"success": True,
            "message": f"send to: {content['email']}"}, status=status.HTTP_200_OK)


