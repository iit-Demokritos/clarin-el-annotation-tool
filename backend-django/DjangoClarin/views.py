import os
from datetime import datetime
from re import I
from time import time
from django.utils.decorators import method_decorator

from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.template import loader
# Create your views here.
from django.template.loader import get_template
from django.views import View
from pymongo import collection
from rest_framework.exceptions import ValidationError

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .handlers import HandlerClass
from .send_email import EmailAlert
from django.contrib.sites.shortcuts import get_current_site
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import MyTokenObtainPairSerializer, CustomUserSerializer, SharedCollectionsSerializer, \
    OpenDocumentsSerializer, ButtonAnnotatorsSerializer, CoreferenceAnnotatorsSerializer, CollectionsSerializer, \
    DocumentsSerializer
from django.utils.encoding import force_bytes, force_text, DjangoUnicodeDecodeError
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
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from bson.objectid import ObjectId
import json 
@method_decorator(ensure_csrf_cookie, name='dispatch')
class ObtainTokenPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer






@method_decorator(ensure_csrf_cookie, name='dispatch')
class CustomUserCreate(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, format='json'):
        # print('email:', request.data['email'], ", username:", request.data["username"],
        #       ', password:', request.data["password"])
        # return Response(request.data, status=status.HTTP_201_CREATED)
        ## TODO: protect on error!
        print(request.data)

        data = {"email": request.data['email'], "first_name": request.data["first_name"],"last_name": request.data["last_name"],
                "password": request.data["password"], "username": request.data["first_name"]+"_"+request.data["last_name"]}
        serializer = CustomUserSerializer(data=data)
        print(1)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                print(2)
                try:
                    ## Send an e-mail for activating the user!
                    json = serializer.data
                    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                    # id     = force_text(urlsafe_base64_decode(uidb64))
                   # domain = get_current_site(request).domain
                    token = account_activation_token.make_token(user)
                    link = reverse('user_activate', kwargs={'uidb64': uidb64, 'token': token})
                    activation_link = request.build_absolute_uri(link)
                   # print(request.build_absolute_uri('/static/images/EllogonLogo.svg'))
                    content = {"user": (user.first_name+" "+user.last_name), "link": activation_link,

                               "email": request.data['email'],
                               "baseurl": request.build_absolute_uri("/")[:-1],
                               "ellogon_logo": "https://vast.ellogon.org/images/logo.jpg"}
                             #  "ellogon_logo": request.build_absolute_uri('/static/images/EllogonLogo.svg')}  # path?
                    activation_alert = EmailAlert(request.data['email'], (user.first_name+" "+user.last_name), content, request)
                    activation_alert.send_activation_email()
                    json = {"success": True, "message": "You were successfully registered"}
                    return Response(json, status=status.HTTP_200_OK)
                except Exception as e:
                    user.delete()
                    print(e)
                    return Response({"success":False,"message":"Registration Error: "+str(e)}, status=status.HTTP_400_BAD_REQUEST)
        print(serializer.errors)
        return Response({"success":False,"message":"Registration Error: "+str(serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class LogoutAndBlacklistRefreshTokenForUserView(APIView):
    #permission_classes = (permissions.AllowAny,)
    #authentication_classes = ()
    def get(self,request):
        try:
            email = request.user
            user = Users.objects.get(email=email)
            tokens = OutstandingToken.objects.filter(user_id=request.user.id)
            for token in tokens:
                t, _ = BlacklistedToken.objects.get_or_create(token=token)
            return Response({"success":True,"message":"You successfully signed out."},status=status.HTTP_200_OK)   
        except Exception as e:
              return Response({"success":True,"message":"Logout error:"+str(e)},status=status.HTTP_400_BAD_REQUEST)  
            
    #change angular request to post with request data refresh token
    def post(self, request):
        #print(request.data)
        try:

            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"success":True,"message":"You successfully signed out."},status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"success":True,"message":"Logout error:"+str(e)},status=status.HTTP_400_BAD_REQUEST)


# ?
@method_decorator(ensure_csrf_cookie, name='dispatch')
class ActivationView(View):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request, uidb64, token):
        id = force_text(urlsafe_base64_decode(uidb64))
        user = Users.objects.get(pk=id)
        message={"message":"Your account activated successfully"}
        #print(user.is_active)
        if ((not account_activation_token.check_token(user, token)) or user.is_active):
            message={"message":"Your account has been already activated"}
           # return HttpResponse('<h1>Your account has been already activated</h1>')  # return correct page?
        user.is_active = True
        user.save()
        template = loader.get_template('activateview.html')
    
        return HttpResponse(template.render(message, request))
        #return HttpResponse('<h1>Your account activated successfully</h1>')  # return correct page?

@method_decorator(ensure_csrf_cookie, name='dispatch')
class InitApp(View):
    def get(self,request):
        #return HttpResponse('<h1>Your account activated successfully</h1>')
        return render(request, 'index.html')


class GetCsrfToken(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def get(self,request):
            cstf_token_val=get_token(request)
            #print(cstf_token_val)
            request.META["X-XSRF-TOKEN"]=cstf_token_val
            return Response(data={"success": True, "data": []},
                                status=status.HTTP_200_OK)




@method_decorator(ensure_csrf_cookie, name='dispatch')
class ChangePassword(APIView):

    def post(self, request):
        try:
            email = request.user
            user = Users.objects.get(email=email)
            data = {"email": email, "password": request.data['old_password']}
            passstatus=check_password(data["password"],user.password)
            print(passstatus)
            #r = requests.post(request.build_absolute_uri(reverse('auth_token_obtain')),
                              #data=data)
            if (passstatus == True):
                user.set_password(request.data["new_password"])
                user.save()
                return Response(data={"success": True, "message": "Your password was successfully updated"},
                                status=status.HTTP_200_OK)
            else:
                return Response(data={"success": False, "message": "Your current password does not match"},
                                status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            #print(e)
            return Response(data={"success": False, "message": "Update password error:"+str(e)},
                            status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class InitPasswords(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    def post(self, request):
        users=Users.objects.all()
        for user in users:
            password = Users.objects.make_random_password()
            user.set_password(password)
            user.save()
            user_ref=user.first_name+" "+user.last_name
            content = {"user": user_ref, "password": password, "email": user.email,
                       "baseurl": request.build_absolute_uri("/")[:-1],
                       "ellogon_logo": request.build_absolute_uri('/static/frontend/images/EllogonLogo.svg')}
            reset_alert = EmailAlert(user.email, user.first_name, content, request)
            reset_alert.send_resetpassword_email()
        return Response(data={"success": True, "message": "All passwords reset"}, status=status.HTTP_200_OK)
        # except Exception as e:
        # print(e)
        # return Response(data={"success": False, "message": "no account with this email found"},
        #                 status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class ResetPassword(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            email = request.data["email"]
            print(email)
            user = Users.objects.get(email=email)
            print(user)
            password = Users.objects.make_random_password()
            user.set_password(password)
            user.save()
            if (user.first_name!=None and user.last_name!=None):
                user_ref = user.first_name + " " + user.last_name
            else:
                user_ref=user.email
          
            content = {"user": user_ref, "password": password, "email": email,
                       "baseurl": request.build_absolute_uri("/")[:-1],
                       "ellogon_logo": "https://vast.ellogon.org/images/logo.jpg" }
            reset_alert = EmailAlert(email,user_ref, content, request)
            reset_alert.send_resetpassword_email()
            return Response(data={
              "success": True,
              "message": "Your password reset was successful. An email with your new password will arrive shortly."}, status=status.HTTP_200_OK)
        except Exception as e:
            #print(e)
            return Response(data={"success": False, "message": "Reset password error:"+str(e)},
                            status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class ManageProfileView(APIView):
    def get(self, request):
        print(request.user)
        return Response(status=status.HTTP_200_OK)



@method_decorator(ensure_csrf_cookie, name='dispatch')
class Me(APIView):

    def get(self, request):
        try:
            user = Users.objects.get(email=request.user)
            return Response(data={"success": True, "data": {"id":user.pk,"email":user.email,"permissions":user.permissions,"last_login":user.last_login,
                              "first_name":user.first_name,"last_name":user.last_name,"created_at":user.created_at,"updated_at":user.updated_at

                                                            }},
                            status=status.HTTP_200_OK)
        except Exception as e:
          #  print(e)
            return Response(data={"success": False, "message": "User info error:"+str(e)},
                            status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class ReturnStatistics(APIView):
    def get(self, request):
        annotations_counter = 0
        collections_counter=0
        documents_counter=0
        print(request.user)
        try:
            owner = Users.objects.get(email=request.user)
            collections = Collections.objects.filter(owner_id=owner)
            documents = Documents.objects.filter(owner_id=owner)
            annotation_col = get_collection_handle(db_handle, "annotations")
            #print(annotation_col)
            annotations= annotation_col.find({"owner_id":owner.pk})
            #for item in annotations:
             #   print(item)
           # print(annotations)
            annotations_counter = annotations.count(True)
           # print(annotations_counter)
            # for document in documents:
            #     annotations=annotation_col.find({"document_id":document.pk})
            #     for annotation in annotations:
            #             annotations_counter = annotations_counter + 1
            collections_counter = collections.count()
            documents_counter = documents.count()
           
           
        except Exception as ex:
            print(ex)
            return Response(data={"success": False,"data":{ "collections": collections_counter, "documents": documents_counter,
                                  "annotations": annotations_counter}},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data":{"collections": collections_counter, "documents": documents_counter,
                              "annotations": annotations_counter}},
                        status=status.HTTP_200_OK)


# 2 & 3
@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleCollection(APIView):
    # def patch():
    def get(self, request, collection_id): 
         try:   
            collection = Collections.objects.filter(id=collection_id)
            if not collection.exists():
                print("HandleCollection (get): Wrong collection id")
                return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)
            else:
                c=collection.get()
                data=[{
                    "id":c.pk,
                    "name":c.name,
                    "owner_id":(c.owner_id).pk,
                    "encoding":c.encoding,
                    "handler":c.handler,
                    "created_at":c.created_at,
                    "updated_at":c.updated_at
                }]
                return Response(data={"success": True,"data":data}, status=status.HTTP_200_OK)
         except Exception as ex:
            print("HandleCollection (delete):" + str(ex))
            return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)


     
    def delete(self, request, collection_id):   #delete shared with me collection??
        try:
            collection = Collections.objects.filter(id=collection_id)
            if not collection.exists():
                print("HandleCollection (delete): Wrong collection id")
                return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)
            annotations = get_collection_handle(db_handle, "annotations")
            annotations_temp = get_collection_handle(db_handle, "annotations_temp")
            documents = Documents.objects.filter(collection_id=collection.get())
        except Exception as ex:
            print("HandleCollection (delete):" + str(ex))
            return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)
        for document in documents:
            annotations.delete_many({"document_id":document.pk})
            annotations_temp.delete_many({"document_id":document.pk})
        collection.delete()
        return Response(data={"success": True}, status=status.HTTP_200_OK)

    def patch(self, request, collection_id):   #delete shared with me collection??
        try:
            collection = Collections.objects.filter(id=collection_id)
            #print(collection)
            if not collection.exists():
                #print("HandleCollection (delete): Wrong collection id")
                return Response(data={"success": False,"exists":False,"flash":"An error occured"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as ex:
            print("HandleCollection (delete):" + str(ex))
            return Response(data={"success": False,"exists":False,"flash":"An error occured"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user=Users.objects.get(email=request.user)
            print(request.data["data"])
            print(request.data["data"]["name"])
            collection_queryset=Collections.objects.filter(name=request.data["data"]["name"],owner_id=user)
            
            print(collection_queryset)
            if(collection_queryset.exists()):
                return Response(data={"success": True, "exists": True,
                                      "flash": "The name you selected already exists. Please select a new name"},
                                status=status.HTTP_200_OK)

        
            serializer=CollectionsSerializer(collection.get(),data={"name":request.data["data"]["name"]},partial=True)
            if serializer.is_valid():
                project = serializer.save()
                return Response(data={"success": True,"exists":False}, status=status.HTTP_200_OK)
        except Exception as ex:
            print("HandleCollection (delete1):" + str(ex))
            return Response(data={"success": True,"exists":True,"flash":"An error occured"}, status=status.HTTP_200_OK)




# 4 & 5
@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleCollections(APIView):
    def get(self, request):
        collection_data = {}
        collections_lst=[]
        try:
            owner = Users.objects.get(email=request.user)
            collections = Collections.objects.filter(owner_id=owner)
            print(collections)
            print(1)
            myshared_collections = SharedCollections.objects.filter(fromfield=owner)
            print(2)
            shared_collections = SharedCollections.objects.filter(tofield=owner)
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
                confirmed=0
                for scitem in sc:
                    if (scitem.confirmed==1):
                        confirmed=1
            else:
                confirmed=None

            collection_data["confirmed"] =confirmed
            collection_data["is_owner"] = 1
            documents = Documents.objects.filter(collection_id=collection)
            collection_data["document_count"] = documents.count()
            #print(collection_data)
            print(collections_lst)
            print("\n")
            collections_lst.append(collection_data)
            collection_data={}
        for tsc in shared_collections:
                if(tsc.confirmed==0):
                    continue
                c1=Collections.objects.get(pk=tsc.collection_id.pk)
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

    def post(self, request):  # overwrite???
        new_data = {}
        try:
            data = request.data["data"]
            owner = Users.objects.get(email=request.user)
        except Exception as ex:
            print("HandleCollections (POST):" + str(ex))
            return Response(data={"success": False,"message":str(ex)}, status=status.HTTP_400_BAD_REQUEST)

        collection = Collections.objects.filter(owner_id=owner, name=data["name"])
        if(collection.exists() and data["overwrite"]==False):
            return Response(data={"success": True,"exists":True,"collection_id":collection.get().pk}, status=status.HTTP_200_OK)
        if (collection.exists() and data["overwrite"] == True):
            c1=collection.get()
            docs=Documents.objects.filter(collection_id=c1)
            for doc in docs:
                doc.delete()
            return Response(data={"success": True, "exists": True, "collection_id": collection.get().pk,"overwrite":True},
                            status=status.HTTP_200_OK)
        new_data["name"] = data["name"]
        new_data["encoding"] = data["encoding"]
        new_data["handler"] ="none"
        if (isinstance(data["handler"],str)==True):
            new_data["handler"]=data["handler"]
        else:
            if (isinstance(data["handler"], dict) == True and "value" in data["handler"].keys() ):

                    new_data["handler"] = data["handler"]["value"]
            else:
                new_data["handler"] =None

        if ("created_at" in data):
            new_data["created_at"]=transformdate(data["created_at"])
        if ("updated_at" in data):
            new_data["updated_at"]=transformdate(data["updated_at"])

        new_data["owner_id"] = owner.pk

        serializer = CollectionsSerializer(data=new_data)
        if serializer.is_valid():
            collection = serializer.save()
            return Response(data={"success": True, "collection_id": collection.pk,"exists":False})  # "exists":false sto output??

        return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class ExistCollection(APIView):
    def get(self,request,collection_name):
        try:
            owner = Users.objects.get(email=request.user)
            duplicateCollection = Collections.objects.filter(owner_id=owner, name=collection_name)
            if (duplicateCollection.exists()):
                duplicateCollectionInstance=duplicateCollection.get()
                return Response(data={"success": True, "exists": True, "flash":"The name you selected already exists. Please select a new name","data":{"name":duplicateCollectionInstance.name,"id":duplicateCollectionInstance.pk,
                                                 "encoding":duplicateCollectionInstance.encoding,"handler":duplicateCollectionInstance.handler,"created_at":duplicateCollectionInstance.created_at,
                                                 "updated_at":duplicateCollectionInstance.updated_at,"owner_id":duplicateCollectionInstance.owner_id.pk

                                                                                                                                                        }},
                                status=status.HTTP_200_OK)
            else:
                return Response(data={"success": True, "exists": False})
        except Exception as ex:
            return Response(data={"success": False,"message":str(ex)}, status=status.HTTP_200_OK)


# 6 & 7
@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleDocuments(APIView):


    def get(self, request, collection_id):
        try:
            collection=Collections.objects.get(pk=collection_id)
            documents = Documents.objects.filter(collection_id=collection)
            docs=[]
            for item in documents:
               docs.append({"owner_email":(item.owner_id).email,"id":item.id,"type":item.type,"name":item.name,"text":item.text,"data_text":item.data_text,
               "data_binary":None,"handler":item.handler,"visualisation_options": item.visualisation_options,"metadata":item.metadata,"external_name":item.external_name,
               "encoding":item.encoding,"version":item.version,"owner_id":(item.owner_id).pk,"collection_id":(item.collection_id).pk,"updated_by":item.updated_by,"created_at":item.created_at,
               "updated_at":item.updated_at})
        except Exception as ex:
            return Response(data={"HandleDocuments :" + str(ex)}, status=status.HTTP_404_NOT_FOUND)
        return Response(data={"success": True, "data": docs}, status=status.HTTP_200_OK)

    def post(self, request,collection_id):
        new_data = {}
        try:
            data = request.data["data"]
            print(data)
            owner = Users.objects.get(email=request.user)
            new_data["name"] = data["name"]
            new_data["external_name"] = data["external_name"]
            new_data["type"] = None
            if ("type" in data and data["type"] is not None):
                
                new_data["type"] = data["type"].lower()
            new_data["metadata"]=None
            if ("metadata" in data):
                new_data["metadata"] =data["metadata"]
            new_data["data_text"]=None
            if ("data_text" in data):
                new_data["data_text"] =data["data_text"]
            new_data["version"]=1
            if ("version" in data):
                new_data["version"] = data["version"]
            #new_data["data_binary"]=None
            #if ("data_binary" in data):
             #   new_data["data_binary"] = data["data_binary"]
            new_data["visualisation_options"]=None
            c=Collections.objects.get(pk=collection_id)
            d=Documents.objects.filter(name=new_data["name"],external_name=new_data["external_name"],collection_id=c)
            v=1
            name=new_data["name"]
            ext_name=data["external_name"]
            while(d.exists()):
                new_data["name"]=name+str(v)
                new_data["external_name"] = ext_name + str(v)
                d = Documents.objects.filter(name=new_data["name"], external_name=new_data["external_name"],
                                             collection_id=c)
                v=v+1


            new_data["text"] = data["text"]
            if (new_data["type"] == "tei xml"):
                if ("visualisation_options" in data):
                    new_data["visualisation_options"]=data["visualisation_options"]

                else:
                    new_data["data_text"]= data["text"]
                    handler = HandlerClass(new_data["text"], "tei")
                    vo_json=handler.apply()["documents"][0]
                    new_data["text"] =vo_json["text"]
                    #print("Tei Document")
                    #print(vo_json.keys())
                    new_data["visualisation_options"]=json.dumps(vo_json["info"])
          
           # print(new_data["visualisation_options"])        
            new_data["collection_id"] = collection_id

            new_data["encoding"] = data["encoding"]
            new_data["handler"] = "none"
            if("handler" in data):
                if (isinstance(data["handler"], str) == True):
                    new_data["handler"] = data["handler"]
                else:
                    if (isinstance(data["handler"], dict) == True and "value" in data["handler"].keys()):

                        new_data["handler"] = data["handler"]["value"]
                    else:
                        new_data["handler"] = None
            else:
                new_data["handler"] = None

            if ("created_at" in data):
                new_data["created_at"] = transformdate(data["created_at"])
            if ("updated_at" in data):
                new_data["updated_at"] = transformdate(data["updated_at"])
            new_data["owner_id"] = owner.pk

            if( "updated_by" in data):
                u=Users.objects.get(email=data["updated_by"])
                new_data["updated_by"] = u.email
            else:
                new_data["updated_by"] = owner.email

            #annotation args?





        except Exception as ex:
            print("HandleDocuments (POST):" + str(ex))
            return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)

        #print(new_data["visualisation_options"])
        serializer = DocumentsSerializer(data=new_data)
        if serializer.is_valid():
            instancedoc=serializer.save()
            return Response(data={"success": True,"collection_id":collection_id,"document_id":instancedoc.pk})
        print(serializer.errors)
        return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)




# 8 & 9
@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleDocument(APIView):


    def delete(self, request,collection_id,document_id):
        try:
            document = Documents.objects.filter(id=document_id)
            if not document.exists():
                print("HandleDocument (delete): Wrong document_id")
                return Response(data={"deleted": False}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as ex:
            print("HandleDocument (delete):" + str(ex))
            return Response(data={"deleted": False}, status=status.HTTP_400_BAD_REQUEST)
        document.delete()
        return Response(data={"success": True}, status=status.HTTP_200_OK)

    def get(self, request,collection_id,document_id):
        try:
            #doc_record={}
            document = Documents.objects.get(id=document_id)
            colletion=Collections.objects.get(id=collection_id)
            doc_record=model_to_dict(document)
            # Laravel: DocumentController->show
            doc_record["is_opened"]=False


            user=Users.objects.get(email=request.user)
            opendocument_length=OpenDocuments.objects.filter(document_id=document,collection_id=colletion).count()
            print("opc")
            print(opendocument_length)
            if (opendocument_length>0):
                doc_record["is_opened"]=True

        except Exception as ex:
            return Response(data={"HandleDocument :" + str(ex)}, status=status.HTTP_404_NOT_FOUND)
        return Response(data={"success": True, "data": doc_record}, status=status.HTTP_200_OK)



class HandlerApply(APIView):
    authentication_classes = []
    permission_classes     = []

    

    def post(self, request, format='json'):
        try:
            #print(request.data)
            data         = request.data
            binary_file  = data.get("binary_file")
            type         = data.get("type")
           # handler_name = data.get("handler_name")
        except Exception as e:
            #print(e)
            return Response({"error": "field_not_exist"}, status=status.HTTP_400_BAD_REQUEST)
        print(data)
       
        if (type == "tei"):
            handler = HandlerClass(binary_file, type)
            json = handler.apply()
            #print(json)
            return Response(json, status=status.HTTP_200_OK)
        else:
            return Response({"error": "handler_not_exist"}, status=status.HTTP_400_BAD_REQUEST)




@method_decorator(ensure_csrf_cookie, name='dispatch')
class ShareCollectionView(APIView):
    def post(self, request, collection_id):
        try:
            data = request.data["data"]
            fromuser = Users.objects.get(email=request.user)
            touser = Users.objects.get(email=data["to"])
            collection = (Collections.objects.filter(pk=data["cid"], name=data["cname"])).get()
            sharecollection = SharedCollections.objects.filter(collection_id=collection,fromfield=fromuser,tofield=touser)
        except Exception as e:
            print(1)
            print(e)
            return Response(data={"success": False, "message": "An error occured:"+str(e)+"Invitation email has not been sent"},
                            status=status.HTTP_200_OK)
        if fromuser.pk == touser.pk:
            return Response(data={"success": False, "message": "You cannot share a collection with yourself."},
                            status=status.HTTP_200_OK)

        if sharecollection.exists():
            return Response(
                data={"success": False, "message": "You have already shared this collection to the user."},
                                 status=status.HTTP_200_OK)
        #     for sc in sharecollections:
        #         if sc.tofield == touser:
        #             return Response(
        #                 data={"success": False, "message": "You have already shared this collection to the user."},
        #                 status=status.HTTP_200_OK)
        uidb64 = urlsafe_base64_encode(force_bytes(fromuser.pk))
        usidb64 = urlsafe_base64_encode(force_bytes(touser.pk))
        upidb64 = urlsafe_base64_encode(force_bytes(collection_id))
        invitation_token.make_my_hash_value(touser.pk, collection_id)
        token = invitation_token.make_token(fromuser)
        link = reverse('api_collection_share_verify',
                       kwargs={'uidb64': uidb64, "usidb64": usidb64, "upidb64": upidb64,"collection_id":collection_id,'token': token})
        invitation_link = request.build_absolute_uri(link)
        # confirmation_code=str
        print(token)
        print(link)
        confirmation_code = uidb64 + "/" + usidb64 + "/" + upidb64 + "/" + token
        data = {"confirmed": 0, "confirmation_code": confirmation_code, "collection_id": collection.pk,
                "fromfield": fromuser.pk, "tofield": touser.pk}
        #
        serializer = SharedCollectionsSerializer(data=data)
        if serializer.is_valid():
            shared_collection = serializer.save()
            content = {"user": touser.first_name, "link": invitation_link, "owner": fromuser.first_name,
                       "collection": collection.name, "email": touser.email,
                       "baseurl": request.build_absolute_uri("/")[:-1],
                       "ellogon_logo": "https://vast.ellogon.org/images/logo.jpg"}
                      # "ellogon_logo": request.build_absolute_uri('/static/images/EllogonLogo.svg')}
            invitation_alert = EmailAlert(touser.email, touser.first_name, content, request)
            invitation_alert.send_sharecollection_email()
            return Response(data={"success": True}, status=status.HTTP_200_OK)
        print(2)
        print(serializer.errors)
        return Response(data={"success": False, "message": "An error occured.Invitation email has not been sent."},
                        status=status.HTTP_200_OK)

    def get(self, request, collection_id):
        collection = Collections.objects.get(pk=collection_id)
        user=Users.objects.get(email=request.user)
        sharecollections = SharedCollections.objects.filter(collection_id=collection, fromfield=user)
        records = []
        for item in sharecollections:
            records.append(
                {"id": item.pk, "collection_id": (item.collection_id).pk, "to": (item.tofield).email, "confirmed": item.confirmed})
        return Response(data={"success": True, "data": records}, status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class SharedCollectionDelete(APIView):
    def delete(self, request, collection_id, share_id):
        sharecollection = SharedCollections.objects.get(pk=share_id)
        sharecollection.delete()
        return Response(data={"success": True}, status=status.HTTP_200_OK)



@method_decorator(ensure_csrf_cookie, name='dispatch')
class AcceptCollectionView(View):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request,collection_id,uidb64, usidb64, upidb64, token):
        try:
            id = force_text(urlsafe_base64_decode(uidb64))
            ids = force_text(urlsafe_base64_decode(usidb64))
            idp = force_text(urlsafe_base64_decode(upidb64))
            owner = Users.objects.get(pk=id)
            shared_user = Users.objects.get(pk=ids)
            collection = Collections.objects.get(pk=idp)
            shared_collection = (
                SharedCollections.objects.filter(collection_id=collection, fromfield=owner, tofield=shared_user)).get()
        except Exception as e:
            message={"message":"The requested invitation does not exist!"}
            template = loader.get_template('activateview.html')
            return HttpResponse(template.render(message, request))
           
             # return correct page?
        confirmed = shared_collection.confirmed
        if (confirmed == False):
            shared_collection.confirmed = True
            shared_collection.save()
            message={"message":"You have successfully accepted the invitation! Start the annotation!"}
            template = loader.get_template('activateview.html')
            return HttpResponse(template.render(message, request))
              # return correct page?

        message={"message":"The requested invitation has already been accepted!"}
        template = loader.get_template('activateview.html')
        return HttpResponse(template.render(message, request))  # return correct page?



@method_decorator(ensure_csrf_cookie, name='dispatch')
class OpenDocumentView(APIView):
    def get(self, request):
        try:
            user = Users.objects.get(email=request.user)
            opendocuments=OpenDocuments.objects.all()
            records=[]
            for opendocument in opendocuments:
                collection=Collections.objects.get(pk=(opendocument.collection_id).pk)
                
                if((opendocument.user_id).pk==user.pk):
                    opened=1
                    print("ok")
                else:
                    opened=0
                shared_collection_queryset=(SharedCollections.objects.filter(collection_id=collection))
                shared_count=0
                confirmed_lst=[]
                print()
                confirmed=None
                for shared_collection in shared_collection_queryset:
                        confirmed=0
                        if (shared_collection.confirmed==1):
                            confirmed=1
                            break
                records.append({"collection_id":(opendocument.collection_id).pk,
                            "document_id":(opendocument.document_id).pk,
                             "annotator_type":opendocument.annotator_type,
                                "db_interactions":opendocument.db_interactions,
                                "opened":opened,"confirmed":confirmed,
                                "user_id":(opendocument.user_id).pk
                                })
                        #confirmed_lst.append(shared_collection.confirmed)
                        #shared_count=shared_count+1
              #  if(shared_count==0):
               #     shared_count=1
                #    confirmed_lst.append(None)
                #for j in range(shared_count):
                 #       records.append({"collection_id":(opendocument.collection_id).pk,
                   #         "document_id":(opendocument.document_id).pk,
                  #           "annotator_type":opendocument.annotator_type,
                    #            "db_interactions":opendocument.db_interactions,
                     #           "opened":opened,"confirmed":confirmed_lst[j]

                      #          })
        except Exception as e:
            return Response(data={"success": False, "data": []}, status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": records}, status=status.HTTP_200_OK)




    def post(self, request):
        try:
            data = request.data["data"]
            collection = Collections.objects.get(pk=data["collection_id"])
            document = Documents.objects.get(pk=data["document_id"])
            user = Users.objects.get(email=request.user)
            opendocument = OpenDocuments.objects.filter(user_id=user.pk, collection_id=collection, document_id=document)
            data = {"annotator_type": data["annotator_type"], "user_id": user.pk,
                    "collection_id": collection.pk, "document_id": document.pk, "db_interactions": 0,
                    "updated_at": datetime.now()}
            if (not (opendocument.exists())):
                serializer = OpenDocumentsSerializer(data=data)
                if serializer.is_valid():
                    opendocument = serializer.save()
            else:
                 serializer = OpenDocumentsSerializer(opendocument.get(),data=data,partial=True)

            return Response(data={"success": True ,"data":{"annotator_type": data["annotator_type"],"collection_id": collection.pk, "document_id": document.pk}})

        except Exception as e:
            print(e)
            return Response(data={"success": False, "message": "An error occured."},
                            status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CollectionDataView(APIView):
    def get(self, request):
        try:
            user = Users.objects.get(email=request.user)
            collections = Collections.objects.filter(owner_id=user)
            shared_collections = SharedCollections.objects.filter(fromfield=user)
            doc_records = []
            confirmed = None
         
            for collection in collections:
                myshared_collection = shared_collections.filter(collection_id=collection)
                if (myshared_collection.exists()):
                         confirmed=0
                         for scitem in myshared_collection:
                                if (scitem.confirmed==1):
                                        confirmed=1
                documents = Documents.objects.filter(collection_id=collection, owner_id=user)
                for document in documents:
                    doc_records.append({"id": document.pk, "name": document.name, "collection_id": collection.pk,
                                        "collection_name": collection.name,
                                        "owner_id": (document.owner_id).pk,
                                        "confirmed": confirmed, "is_owner": 1})
                confirmed = None
             
            shared_collections = SharedCollections.objects.filter(tofield=user, confirmed=1)
           
            #print(shared_collections)
            for shared_collection in shared_collections:
                collection = Collections.objects.get(pk=(shared_collection.collection_id).pk)
               # print(collection)
                documents = Documents.objects.filter(collection_id=collection)
                for document in documents:
                    doc_records.append({"id": document.pk, "name": document.name, "collection_id": collection.pk,
                                        "collection_name": collection.name,
                                        "owner_id": (document.owner_id).pk,
                                        "confirmed": 1, "is_owner": 0})
        except Exception as e:
            print("ssss")
            print(e)
            return Response(data={"success": False, "message": "An error occured here."},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": doc_records}, status=status.HTTP_200_OK)
        # sharedcollections=SharedCollections.objects.filter()



@method_decorator(ensure_csrf_cookie, name='dispatch')
class ButtonAnnotatorView(APIView):
    def get(self, request):

        try:
            user = Users.objects.get(email=request.user)
            button_annotator = (ButtonAnnotators.objects.filter(user_id=user)).get()
            btn_data = {"language": button_annotator.language, "annotation_type": button_annotator.annotation_type,
                        "attribute": button_annotator.attribute, "alternative": button_annotator.alternative}
        except Exception as e:
            return Response(data={"success": True, "data": None},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": btn_data}, status=status.HTTP_200_OK)

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
                serializer = ButtonAnnotatorsSerializer(button_annotator.get(), data=data, partial=True)
                if serializer.is_valid():
                    btn_annotator = serializer.save()

            return Response(data={"success": True})

        except Exception as e:
            print(e)
            return Response(data={"success": False, "message": "An error occured."},
                            status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CoreferenceAnnotatorView(APIView):
    def get(self, request):

        try:
            user = Users.objects.get(email=request.user)
            coreference_annotator = (CoreferenceAnnotators.objects.filter(user_id=user)).get()
            coref_data = {"language": coreference_annotator.language,
                          "annotation_type": coreference_annotator.annotation_type,
                          "alternative": coreference_annotator.alternative}
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": coref_data}, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            user = Users.objects.get(email=request.user)
            coreference_annotator = CoreferenceAnnotators.objects.filter(user_id=user)
            data = {"language": request.data["language"], "annotation_type": request.data["annotation_type"],
                    "alternative": request.data["alternative"],
                    "updated_at": datetime.now()}
            if not (coreference_annotator.exists()):
                data["user_id"] = user.pk
                serializer = CoreferenceAnnotatorsSerializer(data=data)
                if serializer.is_valid():
                    coref_annotator = serializer.save()
            else:
                serializer = CoreferenceAnnotatorsSerializer(coreference_annotator.get(), data=data, partial=True)
            return Response(data={"success": True})
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class SaveTempAnnotationView(APIView):
     def get(self, request, collection_id, document_id):

        records=[]
        try:
            annotations = get_collection_handle(db_handle, "annotations_temp")
            #collection=Collections.objects.get(pk=collection_id)
            #document=Documents.objects.get(pk=document_id)
            #user=Users.objects.get(email=request.user)
           # opendocument=(OpenDocuments.objects.filter(collection_id=collection,document_id=document,user_id=user.pk)).get()
            #annotator_id=opendocument.annotator_type
           # print("here")
            #print(type(collection_id))
            cid=int(collection_id)
            did=int(document_id)
            #print(document_id)
            getfilter = {"collection_id": cid, "document_id": did}
            getquery = annotations.find(getfilter)
            for item in getquery:
                item["_id"]=str(item["_id"])
                records.append(item)
            if (len(records)==0):
                 stored_annotations = get_collection_handle(db_handle, "annotations")
                 getquery = stored_annotations.find(getfilter)
                 for item in getquery:
                        annotations.insert_one(item)
                        records.append(item)
        except Exception as e:
            print(e)
            return Response(data={"success": True, "data": records},

                            status=status.HTTP_200_OK)
        #print(records)
        return Response(data={"success": True, "data": records},

                        status=status.HTTP_200_OK)



     def post(self, request, collection_id, document_id):
       
        try:
            collection = Collections.objects.get(pk=collection_id)
            document = Documents.objects.get(pk=document_id)
            user = Users.objects.get(email=request.user)
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)

        annotations_temp = get_collection_handle(db_handle, "annotations_temp")

        if type(request.data["data"]) == list: #giati?
            for item in request.data["data"]:
                    getquery = annotations_temp.find({"_id":item["_id"]})
                    if(getquery.count()==0):
                        item["_id"]= ObjectId(item["_id"])
                        annotations_temp.insert_one(item)
            opendocument = (OpenDocuments.objects.filter(collection_id=collection, document_id=document, user_id=user.pk)).get()
            opendocument.db_interactions = opendocument.db_interactions + len(request.data["data"])

        if type(request.data["data"]) == dict:
            data=request.data["data"]
            data["_id"]=ObjectId(data["_id"])
            data["updated_by"]=user.email
            data["created_at"]=datetime.now()
            data["updated_at"]=datetime.now()
            annotations_temp.insert_one(data)
            opendocument = (OpenDocuments.objects.filter(collection_id=collection, document_id=document, user_id=user.pk)).get()
            opendocument.db_interactions = opendocument.db_interactions + 1
            opendocument.save()
        return Response(data={"success": True,"db_interactions":opendocument.db_interactions})

@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleTempAnnotationView(APIView):
    def delete(self, request, collection_id, document_id, param):
        try:
            collection = Collections.objects.get(pk=collection_id)
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        try:
            document = Documents.objects.get(pk=document_id)
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        try:
            annotations_temp = get_collection_handle(db_handle, "annotations_temp")
            cid=int(collection_id)
            did=int(document_id)
            if param is None:
                  annotations_temp.delete_many({"collection_id": cid, "document_id": did})
            #annotations = get_collection_handle(db_handle, "annotations")
            ty="id"
            
            if "_" in param:
                ty="type"
            if ty=="id":
                print("here")
                print(param)
                r = annotations_temp.find({"_id": ObjectId(param)})
                for r1 in r:
                    print(r1)
                annotations_temp.delete_one({"_id": ObjectId(param)})
               # r = annotations.find({"_id": param})
                #if r.count() > 0:
                 #   for r1 in r:
                  #      annotations.delete_one(r1)
            else:
                #delete temp annotations?
               # print("ok")
                annotations_temp.delete_many({"collection_id": cid, "document_id": did,"annotator_id": param})

            opendocument = (OpenDocuments.objects.filter(collection_id=collection, document_id=document))
            for od in opendocument:
                od.db_interactions= od.db_interactions+1
                od.save()
            #user = Users.objects.get(email=request.user)
            #opendocument = (OpenDocuments.objects.filter(collection_id=collection, document_id=document, user_id=user.pk))[0]
            #opendocument.db_interactions = opendocument.db_interactions + 1
            #opendocument.save()
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True})

    def put(self, request, collection_id, document_id, param):
        try:
            collection = Collections.objects.get(pk=collection_id)
            document = Documents.objects.get(pk=document_id)
            user = Users.objects.get(email=request.user)
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        try:
            annotations_temp = get_collection_handle(db_handle, "annotations_temp")
            filter = {"_id": ObjectId(param)}
            ann=annotations_temp.find_one(filter)
            data=request.data["data"]

           # print(data)
            data["_id"]=ObjectId(data["_id"])
            data["updated_by"]=user.email
            data["updated_at"]=datetime.now()
            #date_time_str = '2018-06-29 08:15:27.243860'
           # date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dΤ%H:%M:%S.%f+00:00')
            #  d  data["updated_at"]  data["updated_at"] 2021-07-26T13:20:53.564+00:00
            print("created")
            print(ann["created_at"])
            data["created_at"]=ann["created_at"]
            #print(data["created_at"])
            newvalues = {"$set": data}
            annotations_temp.update_one(filter, newvalues)
            opendocument = (
                OpenDocuments.objects.filter(collection_id=collection, document_id=document, user_id=user.pk)).get()
            opendocument.db_interactions = opendocument.db_interactions + 1
            opendocument.save()
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True})

    def get(self, request, collection_id, document_id, param):
        records = []
        cid_int = int(collection_id)
        did_int = int(document_id)
        try:
            annotations_temp = get_collection_handle(db_handle, "annotations_temp")
            getfilter = {"collection_id": cid_int, "document_id": did_int, "annotator_id": param}
           # print(getfilter)
            getquery = annotations_temp.find(getfilter)
           # print(getquery.count())
            for item in getquery:
                item['_id']=str(item['_id'])
                records.append(item)
           # print(records)
            if (len(records)==0):
                 stored_annotations = get_collection_handle(db_handle, "annotations")
                 getquery = stored_annotations.find(getfilter)
                 for item in getquery:
                        annotations_temp.insert_one(item)
                        item['_id']=str(item['_id'])
                        records.append(item)

        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": records},
                        status=status.HTTP_200_OK)







@method_decorator(ensure_csrf_cookie, name='dispatch')
class OpenDocumentRetrieve(APIView):
    def get(self,request,document_id):
        data=[]
        try:
                user = Users.objects.get(email=request.user)
                document=Documents.objects.get(pk=document_id)
                owner_id=(document.owner_id).pk



                opendocument_queryset=OpenDocuments.objects.filter(document_id=document)
                for opendocument in opendocument_queryset:
                    opened=0
                    owner=0
                    if ((opendocument.user_id).pk==user.pk):
                        opened=1
                        
                    if ((opendocument.user_id).pk==owner_id):
                           owner=1   
                    record={"collection_id":(opendocument.collection_id).pk,"document_id":(opendocument.document_id).pk,"annotator_type":opendocument.annotator_type,
                    "db_interactions":opendocument.db_interactions,"confirmed":None,"opened":opened,"user_id":(opendocument.user_id).pk,"first_name":(opendocument.user_id).first_name,
                    "last_name":(opendocument.user_id).last_name, "email":(opendocument.user_id).email,"owner":owner}
                    sharedcollectionset=SharedCollections.objects.filter(collection_id=opendocument.collection_id)
                    for sharedcollection in sharedcollectionset:
                        record["confirmed"]=sharedcollection.confirmed
                        if (sharedcollection.confirmed==1):
                            break
                    data.append(record)

        except Exception as e:
                print(e)
                return Response(data={"success": True, "data":data},status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": data},status=status.HTTP_200_OK)






#fix for many open documents
@method_decorator(ensure_csrf_cookie, name='dispatch')
class OpenDocumentUpdate(APIView):
    def get(self,request,document_id,Button_Annotator_name):
            data=[]
            try:
                user = Users.objects.get(email=request.user)
                document=Documents.objects.get(pk=document_id)
                opendocument_queryset=OpenDocuments.objects.filter(user_id=user,document_id=document)
                opendocument=opendocument_queryset.get()
                collection_id=(opendocument.collection_id).pk
                shared_collections=SharedCollections.objects.filter(collection_id=(opendocument.collection_id).pk)#?
                confirmed=None

                for shared_collection in shared_collections:
                    print(shared_collection.fromfield.pk)
                    print(shared_collection.confirmed)
                    print(user.pk)
                    if((shared_collection.fromfield).pk==user.pk):
                        confirmed=shared_collection.confirmed
                        break
                    if ((shared_collection.tofield).pk == user.pk):
                        #print(shared_collection.confirmed)
                        confirmed = shared_collection.confirmed
                        break
                #for opendocument in opendocument_queryset:




                data.append({"collection_id":collection_id,"document_id":int(document_id),"db_interactions":opendocument.db_interactions,
                                 "annotator_type":Button_Annotator_name,"confirmed":confirmed,"opened":1})
                opendocument.db_interactions=0
                opendocument.updated_at=datetime.now()
                opendocument.save()
            except Exception as e:
                print(e)
                return Response(data={"success": True, "data":data},
                                status=status.HTTP_200_OK)
            return Response(data={"success": True, "data": data},
                            status=status.HTTP_200_OK)
    def delete(self,request,document_id,Button_Annotator_name):
        try:
                user = Users.objects.get(email=request.user)
                document=Documents.objects.get(pk=document_id)
                opendocument_queryset=OpenDocuments.objects.filter(user_id=user,document_id=document,annotator_type=Button_Annotator_name)
                opendocument=opendocument_queryset.get()
                opendocument.delete()
                return Response(data={"success": True,"message":"open document deleted"}, status=status.HTTP_200_OK)
        except Exception as e:
                print(e)
                return Response(data={"success": False, "message":"An error occured"},
                                status=status.HTTP_200_OK)
               
        




    # annotations_temp.delete_one
@method_decorator(ensure_csrf_cookie, name='dispatch')
class DeleteSavedAnnotations(APIView):
    def delete(self, request, collection_id, document_id, Button_Annotator_name):
        records = []
        try:
          #  annotations_temp = get_collection_handle(db_handle, "annotations_temp")
            annotations = get_collection_handle(db_handle, "annotations")
            getfilter = {"collection_id": int(collection_id), "document_id": int(document_id),
                         "annotator_id": Button_Annotator_name}
            getquery = annotations.find(getfilter)
            for item in getquery:
                annotations.delete_one(item)
               # record = annotations.find(item)
               # for annotation in record:
                #    annotations_temp.delete_one(annotation)
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True})






@method_decorator(ensure_csrf_cookie, name='dispatch')
class DocumenAnnotationView(APIView):
    def get(self, request, collection_id, document_id):

        records=[]
        try:
            annotations = get_collection_handle(db_handle, "annotations")
           # collection=Collections.objects.get(pk=collection_id)
            #document=Documents.objects.get(pk=document_id)
            #user=Users.objects.get(email=request.user)
           # opendocument=(OpenDocuments.objects.filter(collection_id=collection,document_id=document,user_id=user.pk)).get()
            #annotator_id=opendocument.annotator_type
            #print("here")
            print(type(collection_id))
            cid=int(collection_id)
            did=int(document_id)
            #print(document_id)
            getfilter = {"collection_id": cid, "document_id": did}
            getquery = annotations.find(getfilter)
            for item in getquery:
                item["_id"]=str(item["_id"])
                records.append(item)
        except Exception as e:
            print(e)
            return Response(data={"success": True, "data": records},

                            status=status.HTTP_200_OK)
        print(records)
        return Response(data={"success": True, "data": records},

                        status=status.HTTP_200_OK)

    def post(self, request, collection_id, document_id):


        # try:
        #     collection = Collections.objects.get(pk=collection_id)
        # except Exception as e:
        #     return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        # try:
        #     document = Documents.objects.get(pk=document_id)
        # except Exception as e:
        #     return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        try:
           # annotations_temp = get_collection_handle(db_handle, "annotations_temp")
            print("save")
            annotations = get_collection_handle(db_handle, "annotations")
            data = request.data["data"]
            for item in data:
                #print(1)
                record = annotations.find({"_id": item["_id"]})
                #for temp_annotation in record:
                 #   record2 = annotations.find({"_id": temp_annotation["_id"]})
                #print(11) 
                for annotation in record:
                   #item["created_at"]=annotation["created_at"]
                   #item["created_at"]=annotation["updated_at"]
                   annotations.delete_one(annotation)
                #print(111) 
                item["_id"]= ObjectId(item["_id"])
               # print(1111) 
               # if (item["attributes"]["type"]=="setting annotation"):
                #   item["created_at"]= item["created_at"]+".000000"
                 #  item["updated_at"]=item["update_at"]+".000000"
                #print("created_at")
                item["created_at"]=transformdate(item["created_at"])
                #print(1111) 
                print("updated_at")
                item["updated_at"]=transformdate(item["updated_at"])
                #print(11111) 
                annotations.insert_one(item)
        except Exception as e:
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True})

# class ImportCollectionView(APIView):
#     def post(self,request):
#         user = Users.objects.get(email=request.user)
#         return Response(data={"hello": "world"}, status=status.HTTP_200_OK)
@method_decorator(ensure_csrf_cookie, name='dispatch')
class ImportAnnotationsView(APIView):
    def post(self,request,collection_id,document_id):
        annotations=request.data["data"]
        print("import from export")
        print(type(annotations))
        if (isinstance(annotations, list) == True):
            if (len(annotations)>=0):
                col_annotations = get_collection_handle(db_handle, "annotations")
                exclude_keys = ['_id', 'collection_id', 'document_id']
                for item in annotations:
                    new_item={k: item[k] for k in set(list(item.keys())) - set(exclude_keys)}
                    new_item['collection_id']=int(collection_id)
                    new_item["document_id"]=int(document_id)
                    new_item['created_at']=transformdate(item["created_at"])
                    new_item["updated_at"]=transformdate(item["updated_at"])
                    col_annotations.insert_one(new_item)
                return Response(data={"success": True},status=status.HTTP_200_OK)
        else:
             if (isinstance(annotations, dict) == True):
                print("dict")
                col_annotations = get_collection_handle(db_handle, "annotations")
                col_annotations_temp = get_collection_handle(db_handle, "annotations_temp")
                exclude_keys = ['_id']
                ann=annotations
                new_ann={k: ann[k] for k in set(list(ann.keys())) - set(exclude_keys)}
                #new_ann['collection_id']=int(collection_id)
                #new_item["document_id"]=int(document_id)
                new_ann['created_at']=transformdate(new_ann["created_at"])
                new_ann["updated_at"]=transformdate(new_ann["updated_at"])
                print(new_ann)
                if (new_ann["type"]!="setting annotation"):
                     col_annotations.insert_one(new_ann)
                     col_annotations_temp.insert_one(new_ann)
                return Response(data={"success": True},status=status.HTTP_200_OK)
                    #item["collection_id"]=collection_id
                    #item["document_id"]=document_id
        return Response(data={"success": False,"message":"Invalid Annotations"}, status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class ExportCollectionView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = () # replace href reference in manage-collections.component.html with
    # a  request function method



    def get(self, request, collection_id):
        data = {}
        try:
            collection = Collections.objects.get(pk=collection_id)
            annotations = get_collection_handle(db_handle, "annotations")
            # collection = model_to_dict(collection)
            for attr, value in collection.__dict__.items():
                if not attr == "_state":
                    if (attr=="owner_id_id"):
                            attr="owner_id"
                    # print("Record1 is " + str(attr) + " = " + str(value))
                    data[attr] = value
            documents = Documents.objects.filter(collection_id=collection)
            doc_records = []
            doc_record = {}
            document_annotations = []
            exclude_keys=["_state","owner_id_id","collection_id_id"]
            for document in documents:
                
                for attr, value in document.__dict__.items():
                    if not (attr in exclude_keys):
                     
                        #print(attr)
                     #   if (attr=="owner_id_id"):
                      #      attr="owner_id"
                       # if(attr=="collection_id_id"):
                        #    attr="collection_id"
                        # print("Record2 is " + str(attr) + " = " + str(value))
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
        except Exception as e:
            return JsonResponse(data={"success": True, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return JsonResponse(data={"success": True, "message": "ok", "data": data},
                        status=status.HTTP_200_OK)



import os
#import pandas as pd

def str2date(strdate):
    try:
            dt_tuple = tuple([int(x) for x in strdate[:10].split('-')]) + tuple([int(x) for x in strdate[11:].split(':')])
            #print(dt_tuple)
            datetimeobj = datetime(*dt_tuple)
    except Exception as e:
        datetimeobj = datetime.now()
    return datetimeobj

def transformdate(datetime_str):
        if ("." not in datetime_str):
            datetime_str=datetime_str+".000000"

        datetime_parts = datetime_str.split("T")
        # print(datetime_parts)
        date_segment = datetime_parts[0]
        time_segment=((datetime_parts[1][0:len(datetime_parts[1])-1]).split("."))[0]
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
            time_parts[i] = int(time_parts[i])
        # print(date_parts)
        # print(time_parts)
        output_datetime = datetime(date_parts[0], date_parts[1], date_parts[2], time_parts[0], time_parts[1],
                                            time_parts[2])
        return output_datetime
    #  cwd = os.getcwd()



import mysql.connector 

@method_decorator(ensure_csrf_cookie, name='dispatch')
class MainView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()



 
 

    def get(self, request):
      
        cnx = mysql.connector.connect(user='clarinel', password='FaRXgxC2mpVYhmqj',port=3306,host='127.0.0.1',database='clarin_annotations')
        print(cnx)
        if (cnx.is_connected()):
                print("Connected")
        else:
                print("Not connected")
        u=Users.objects.get(email="granna_93@yahoo.gr")
        print(u)
        u.password="clarinbcrypt_sha256$"+"$2y$10$nkX27HErNGLOyEJ1hiipjuDYXg9nHS8sorBOAruxE4q4u./8gRHL."
        u.save()
        #$2y$10$RhIEgl5ocyav3VkF8jdMXeOC/gjHnJfkuLWAzv5PPadterA361q4S
        #  df = pd.read_csv('./clarin_backend/data/users.csv')
         # file="users" 
          #if(file=="users"):
           # for index, row in df.iterrows():
            #     print(row)
             #    user=Users(pk=row["id"],username=row["email"],email=row["email"],first_name=row["email"],last_name=None,permissions=None,last_login=str2date(row["last_login"]),created_at=str2date(row["created_at"]),
              #   updated_at= str2date(row["updated_at"]))
               #  user.set_password("12345678")
                # user.save()

         # df = pd.read_csv('./clarin_backend/data/collections.csv')
          #file="collections"
        #  if (file == "collections"):
            # for index, row in df.iterrows():
             #    print(row)
              #   user=Users.objects.get(pk=row["owner_id"])
               #  collection=Collections(pk=row["id"],name=row["name"],owner_id=user,encoding=row["encoding"],handler=row["handler"],created_at=str2date(row["created_at"]),
                ##collection.save()
         # df = pd.read_csv('./clarin_backend/data/documents.csv')
          #file="documents"     
          #if (file == "documents"):
          #           for index, row in df.iterrows():
           #              user = Users.objects.get(pk=row["owner_id"])
            #             collection=Collections.objects.get(pk=row["collection_id"])
             #            if(row["type"]!="tei xml" and row["type"]!="tei xml"):
              #               typeval=None
               #              visualisation_options=None
                #             handler="none"
                 #            data_text=None
                   #      else:
                    #         typeval=row["type"]
                     #        visualisation_options = row["visualisation_options"]
                      #       handler = row["handler"]
                       #      data_text=row["data_text"]
                        # document=Documents(pk=row["id"],name=row["name"],text=row["text"],data_binary=None,version=row["version"],encoding=row["encoding"],updated_by=row["updated_by"],external_name=row["external_name"],metadata=None,created_at=str2date(row["created_at"]),owner_id=user,collection_id=collection,handler=handler,updated_at= str2date(row["updated_at"]),type=typeval,visualisation_options=visualisation_options,data_text=data_text)
                         #document.save()
        
         # df = pd.read_csv('./clarin_backend/data/open_documents.csv')
          #file="open_documents"  
          #if (file == "open_documents"):
           #          for index, row in df.iterrows():
            #             print(row)
             #            collection = Collections.objects.get(pk=row["collection_id"])
              #           document = Documents.objects.get(pk=row["document_id"])
               #          user = Users.objects.get(pk=row["user_id"])
                #         open_document=OpenDocuments(user_id=user,collection_id=collection,document_id=document,annotator_type=row["annotator_type"],db_interactions=row["db_interactions"],created_at=str2date(row["created_at"]),
                 #        updated_at= str2date(row["updated_at"]))
                  #       open_document.save()
          #df = pd.read_csv('./clarin_backend/data/button_annotators.csv')
          #file="button_annotators" 
          #if(file=="button_annotators"):
           #  for index, row in df.iterrows():
       
             #    user = Users.objects.get(pk=row["user_id"])
              #   button_annotator=ButtonAnnotators(user_id=user,language=row["language"],annotation_type=row["annotation_type"],attribute=row["attribute"],alternative=row["alternative"],created_at=str2date(row["created_at"]),updated_at=str2date(row["updated_at"]))
               #  button_annotator.save()
          #df = pd.read_csv('./clarin_backend/data/coreference_annotators.csv')
          #file="coreference_annotators" 
          #if (file == "coreference_annotators"):
           #          for index, row in df.iterrows():
            #             user = Users.objects.get(pk=row["user_id"])
             #            coreference_annotator = CoreferenceAnnotators(user_id=user, language=row["language"],annotation_type=row["annotation_type"],alternative=row["alternative"],created_at=str2date(row["created_at"]),updated_at=str2date(row["updated_at"]))
              #           coreference_annotator.save()
          #df = pd.read_csv('./clarin_backend/data/shared_collections.csv')
          #file="shared_collections"
          #if (file == "shared_collections"):
           #  for index, row in df.iterrows():
            #     print(row)
             #    fuser = Users.objects.get(email=row["from"])
              #   tuser=Users.objects.get(email=row["to"])
               #  collection = Collections.objects.get(pk=row["collection_id"])
                # shared_collection=SharedCollections(pk=row["id"],collection_id=collection,fromfield=fuser,tofield=tuser,confirmation_code=row["confirmation_code"],confirmed=row["confirmed"],created_at=str2date(row["created_at"]),
                 #updated_at= str2date(row["updated_at"]))
                 #shared_collection.save()
        return Response(data={"hello": "world"}, status=status.HTTP_200_OK) 
       #
       #
       #                  #print(row)
       #
       #          # print("\n")
       #  #if(file=="collections"):
       #
       #  # print(request.META.get('HTTP_AUTHORIZATION') )
       # # token = request.META.get('HTTP_AUTHORIZATION', " ").split(' ')[1]



       # print(request.user)
        # print(token)
        # data = {'token': token}
        # try:
        #     valid_data = VerifyJSONWebTokenSerializer().validate(data)
        #     print(valid_data)
        #     #user = valid_data['user']
        #     #request.user = user
        # except ValidationError as v:
        #     print("validation error", v)

        #return Response(data={"hello": "world"}, status=status.HTTP_200_OK)
