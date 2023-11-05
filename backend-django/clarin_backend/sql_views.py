import json
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.forms.models import model_to_dict
from django.utils import timezone
from django.http import JsonResponse
from .handlers import HandlerClass
from rest_framework import status

from .models import Users, Collections, SharedCollections, \
        OpenDocuments, Documents, \
        ButtonAnnotators, CoreferenceAnnotators
from django.db.models import Q

from .utils import ErrorLoggingAPIView, ErrorLoggingAPIViewList, ErrorLoggingAPIViewDetail
from .mongodb_views import *
from .serializers import *

from drf_spectacular.utils import extend_schema_view, extend_schema
#, OpenApiParameter, OpenApiExample
#from drf_spectacular.types import OpenApiTypes
#from rest_framework.decorators import action

import io; # For reading images from strings...
import base64
## For creating FieldFile/ImageField fields from data...
from django.core.files.base import ContentFile
from PIL import Image
import urllib ;# For data urls...

## Custom JSON encoder for image/file fields...
from .encoders import ExtendedJSONEncoder
from django.core.serializers import serialize

class SQLDBAPIView(ErrorLoggingAPIView):

    @staticmethod
    def normaliseNewlines(text):
        return text
        if not text:
            return text
        return "\n".join(text.splitlines())

##############################################
## Documents
##############################################
@method_decorator(ensure_csrf_cookie, name='dispatch')
class DocumentsView(SQLDBAPIView):
    """
    Document Controller
    """
    http_method_names = ["get", "post", "patch", "delete"]

    # List all instances. (GET)
    def list(self, request, cid): 
        collection = self.getCollection(request.user, cid)
        documents  = self.getCollectionDocuments(request.user, collection)
        docs = []
        for doc in documents:
            docs.append({
                "id":                    doc.id,
                "collection_id":         doc.collection_id.pk,
                "name":                  doc.name,
                "external_name":         doc.external_name,
                "type":                  doc.type,
                "text":                  self.normaliseNewlines(doc.text),
                "data_text":             self.normaliseNewlines(doc.data_text),
                "data_binary":           doc.data_binary,
                "data_image":            doc.data_image.url if doc.data_image.name else None,
                "data_file":             doc.data_file.url  if doc.data_file.name else None,
                "encoding":              doc.encoding,
                "handler":               doc.handler,
                "visualisation_options": doc.visualisation_options,
                "owner_id":              doc.owner_id.pk,
                "owner_email":           doc.owner_id.email,
                "metadata":              doc.metadata,
                "version":               doc.version,
                "updated_by":            doc.updated_by,
                "created_at":            doc.created_at,
                "updated_at":            doc.updated_at
            })
        return docs
    
    # Retrieve a single instance. (GET)
    def retrieve(self, request, cid, did):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.get(id=did)
        is_opened  = OpenDocuments.objects \
            .filter(collection_id       = collection, 
                    document_id         = document,
                    db_interactions__gt = 0) \
            .count()
        doc_record = model_to_dict(document)
        doc_record['data_image'] = doc_record['data_image'].url if doc_record['data_image'].name else None
        doc_record['data_file']  = doc_record['data_file'].url  if doc_record['data_file'].name else None

        ## Normalise newlines, as expected by codemirror:
        ##   lineSeparator: string|null
        ##   Explicitly set the line separator for the editor. By default (value null),
        ##   the document will be split on CRLFs as well as lone CRs and LFs,
        ##   and a single LF will be used as line separator in all output
        doc_record['text']      = self.normaliseNewlines(doc_record['text'])
        doc_record['data_text'] = self.normaliseNewlines(doc_record['data_text'])
        if (is_opened > 0):
            doc_record["is_opened"] = True
        else:
            doc_record["is_opened"] = False
        # return {"success": True, "data": doc_record}, \
        #        status.HTTP_200_OK
        return doc_record

    # Create a new instance. (POST)
    def create(self, request, cid):
        collection = self.getCollection(request.user, cid)
        duplicateCounter = -1;
        unique_identifier = 1;
        data = request.data["data"]
        # print("DATA:", data)
        # return {"success": False, "message": "DEBUG"}, status.HTTP_400_BAD_REQUEST

        new_data = {}
        new_data["name"] = data["name"]
        owner = request.user
        new_data["type"] = "text"
        if ("type" in data and data["type"] is not None):
            new_data["type"] = data["type"].lower()

        ## Do we have an image? Since images are saved as files in
        ## disk, we must be sure it is an image!
        if (new_data["type"] != "text" and "data_image" in data and data["data_image"]):
            try:
                if data["data_image"].startswith("data:"):
                    response = urllib.request.urlopen(data["data_image"])
                    raw_image_data = response.file.read()
                    image = Image.open(io.BytesIO(raw_image_data))
                else:
                    raw_image_data = base64.b64decode(data["data_image"])
                    image = Image.open(io.BytesIO(raw_image_data))
                image.verify()
                imgType = image.format.lower()
                image.close()
            except IOError:
                return {"success": False, "message": "Invalid Image Data"}, status.HTTP_400_BAD_REQUEST
            ## Do we have the correct type?
            if (imgType != new_data["type"]):
                return {"success": False, "message": f"Invalid Image Type: {image.format.lower()}"}, status.HTTP_400_BAD_REQUEST
            new_data["data_image"] = ContentFile(raw_image_data, name=new_data["name"])
            ## Make sure the text is not None...
            if ("text" not in data or data["text"] is None):
                new_data["text"] = "{}"
                data["text"]     = "{}"

        ## Audio...
        if new_data["type"].lower().startswith("audio "):
            if "data_audio" in data and data["data_audio"]:
                try:
                    if data["data_audio"].startswith("data:"):
                        response = urllib.request.urlopen(data["data_audio"])
                        raw_data = response.file.read()
                    else:
                        raw_data = base64.b64decode(data["data_audio"])
                except IOError:
                    return {"success": False, "message": "Invalid Audio Data"}, status.HTTP_400_BAD_REQUEST
                new_data["data_file"] = ContentFile(raw_data, name=new_data["name"])
                ## Make sure the text is not None...
                if ("text" not in data or data["text"] is None):
                    new_data["text"] = "{}"
                    data["text"]     = "{}"
            else:
                return {"success": False, "message": "Field 'data_audio' missing"}, status.HTTP_400_BAD_REQUEST

        ## Video...
        if new_data["type"].lower().startswith("video "):
            if "data_video" in data and data["data_video"]:
                try:
                    if data["data_video"].startswith("data:"):
                        response = urllib.request.urlopen(data["data_video"])
                        raw_data = response.file.read()
                    else:
                        raw_data = base64.b64decode(data["data_video"])
                except IOError:
                    return {"success": False, "message": "Invalid Video Data"}, status.HTTP_400_BAD_REQUEST
                new_data["data_file"] = ContentFile(raw_data, name=new_data["name"])
                ## Make sure the text is not None...
                if ("text" not in data or data["text"] is None):
                    new_data["text"] = "{}"
                    data["text"]     = "{}"
            else:
                return {"success": False, "message": "Field 'data_video' missing"}, status.HTTP_400_BAD_REQUEST

        handler_apply = False
        if ("handler" in data):
            if (isinstance(data["handler"], str) == True):
                new_data["handler"] = data["handler"]
            elif (data["handler"] is None): 
                new_data["handler"] = "none"
            else:
                if (isinstance(data["handler"], dict) == True):
                    if ("value" in data["handler"]):
                         new_data["handler"] = data["handler"]["value"]
                    else:
                       new_data["handler"] = "none"
                    if ("name" in data["handler"]):
                         new_data["handler_name"] = data["handler"]["name"]
                         handler_apply = True
                    else:
                       new_data["handler_name"] = None
                    
        new_data["metadata"] = None
        if ("metadata" in data):
            new_data["metadata"] = data["metadata"]
        new_data["data_text"] = None
        if ("data_text" in data):
            new_data["data_text"] = data["data_text"]
        if ("data_binary" in data):
            new_data["data_binary"] = data["data_binary"]
        new_data["visualisation_options"] = None
        if ("visualisation_options" in data):
            new_data["visualisation_options"] = data["visualisation_options"]
                    
        new_data["version"] = 1
        if ("version" in data):
            new_data["version"] = data["version"]
        new_data["encoding"]      = data["encoding"]
        new_data["owner_id"]      = owner.pk
        new_data["updated_by"]    = owner.email
        new_data["collection_id"] = cid
        # check type for assigning right value to binary
        binary = False 
        handler_type= new_data["handler"].lower()
        if (handler_type=="none" or handler_apply == False):
            new_data["text"] = data["text"]
        else:
            if (handler_apply==True):
                handler = HandlerClass(data["text"], new_data["handler"])
                vo_json = handler.apply()["documents"][0]
                if (binary==True):
                    new_data["data_binary"]= data["text"] 
                else:
                    new_data["data_text"] = data["text"]
                new_data["text"] = vo_json["text"]
                if ("info" in vo_json):
                    new_data["visualisation_options"] = json.dumps(vo_json["info"])
                else:
                    new_data["visualisation_options"] = None
        
        name = new_data["name"]
        d = Documents.objects.filter(name=new_data["name"],collection_id=collection)
        v = 1
        while(d.exists()):
            new_data["name"] = name+"_"+str(v)
            d = Documents.objects.filter(name=new_data["name"],collection_id=collection)
            v = v+1
        new_data["external_name"]= new_data["name"]
        serializer = DocumentsSerializer(data=new_data)
        if serializer.is_valid():
            instancedoc = serializer.save()  
            return {"success": True, "collection_id": cid, "document_id": instancedoc.pk}
        else:
            serializer.is_valid(raise_exception=True)
            return {"success": False, "message": str(serializer.errors)}, status.HTTP_400_BAD_REQUEST         

    # # Update an existing instance. (PUT)
    # def update(self, request, _id):
    # # Partially update an existing instance. (PATCH)
    # def partial_update(self, request, _id):
    def partial_update(self, request, cid, did):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.filter(id=did)
        if not document.exists():
                return{"success": False, "exists": False, "flash": "An error occured"}, status.HTTP_400_BAD_REQUEST
        document_queryset = Documents.objects.filter(name=request.data["data"]["name"],collection_id=collection)
        
        print(document_queryset)
        if(document_queryset.exists()):
                return {"success": True, "exists": True, "flash": "The name you selected already exists. Please select a new name"},status.HTTP_200_OK
        serializer = DocumentsSerializer(document.get(), data={"name": request.data["data"]["name"],"external_name":request.data["data"]["name"],"updated_at":timezone.now()}, partial=True)
        if serializer.is_valid():
                d = serializer.save()
                return {"success": True, "exists": False}, status.HTTP_200_OK
        else:
            return{"success": False, "exists": False, "flash": "An error occured"}, status.HTTP_400_BAD_REQUEST
        
    # # Destroy an existing instance. (DELETE)
    def destroy(self, request, cid, did):
        collection = self.getCollection(request.user, cid)
        document   = Documents.objects.filter(id=did)
        if not document.exists():
            return {
                {"deleted": False}
            }, status.HTTP_400_BAD_REQUEST
        ## We do not now if exceptions have occured internally...
        annController = AnnotationsView()
        annController.destroy(request, cid, did, 'null')
        tempAnnController = TempAnnotationsView()
        tempAnnController.destroy(request, cid, did, 'null')
        document.delete()
        return {"deleted": True}

@extend_schema_view(
    ## Method: list
    get=extend_schema(request=None,responses={200: None},operation_id="list_collection_documents",
        description="Gets collection id and returns a list with the documents of the collection with the given id.",
    ),
    ## Method: create
    post=extend_schema(request=None,responses={200: None},
        description="Gets collection id and document data and creates a new document record.",
    ),
)
class DocumentsViewList(ErrorLoggingAPIViewList, DocumentsView):
    pass

@extend_schema_view(
    ## Method: retrieve
    get=extend_schema(request=None,responses={200: None},operation_id="retrieve_document",
        description="Gets collection id and document id and returns the document record.",
    ),
    ## Method: partial_update
    patch=extend_schema(request=None,responses={200: None},
        description="Gets collection id and document id and renames the document with the given document id.",
    ),
    ## Method: destroy
    delete=extend_schema(request=None,responses={200: None},
        description="Gets collection id and document id and deletes the document with the given document id.",
    ),
)
class DocumentsViewDetail(DocumentsView):
    http_method_names = ["get", "patch", "delete"]

##############################################
## Shares
##############################################
@method_decorator(ensure_csrf_cookie, name='dispatch')
class SharesView(SQLDBAPIView):
    """
    Shares Controller
    """
    http_method_names = ["get"]

    def sharedEntryToDict(self, e):
        return {
                "id":                e.pk,
                "confirmed":         e.confirmed,
                "created_at":        e.created_at,
                "updated_at":        e.updated_at,
                "collection_id":     e.collection_id.pk,
                "collection_name":   e.collection_id.name,
                "from_email":        e.fromfield.email,
                "to_email":          e.tofield.email,
                "confirmation_code": e.confirmation_code
            }

    # List all instances. (GET)
    def list(self, request):
        self.ensureAuthenticatedUser(request)
        shared_by_me = []
        for e in SharedCollections.objects \
                .filter(fromfield = request.user, confirmed = 1):
            shared_by_me.append(self.sharedEntryToDict(e))
        shared_with_me = []
        for e in SharedCollections.objects \
                .filter(tofield = request.user, confirmed = 1):
            shared_with_me.append(self.sharedEntryToDict(e))
        shared_by_me_pending = []
        for e in SharedCollections.objects \
                .filter(fromfield = request.user, confirmed = 0):
            shared_by_me.append(self.sharedEntryToDict(e))
        shared_with_me_pending = []
        for e in SharedCollections.objects \
                .filter(tofield = request.user, confirmed = 0):
            shared_with_me.append(self.sharedEntryToDict(e))

        return {
            'shared_by_me':           shared_by_me,
            'shared_with_me':         shared_with_me,
            'shared_by_me_pending':   shared_by_me_pending,
            'shared_with_me_pending': shared_with_me_pending,
        }

    # Partially update an existing instance. (PATCH)
    def partial_update(self, request, sid):
        self.ensureAuthenticatedUser(request)
        data = request.data
        # print("DATA:", data)
        # Locate the object...
        entry = SharedCollections.objects.get(pk=sid,
                                              collection_id=data['collection_id'],
                                              confirmation_code=data['confirmation_code'],
                                              fromfield=data['from_email'],
                                              tofield=data['to_email']
                                              )
        entry.confirmed  = data['confirmed']
        entry.updated_at = timezone.now()
        entry.save()
        return self.sharedEntryToDict(entry)

@extend_schema_view(
    ## Method: list
    get=extend_schema(request=None,responses={200: None},operation_id="list_shares",
        description="Returns information about the Collections shared by and shared to the user. Requires an authenticated user.",
    ),
)
class SharesViewList(ErrorLoggingAPIViewList, SharesView):
    pass

@extend_schema_view(
    ## Method: retrieve
    get=extend_schema(request=None,responses={200: None},operation_id="retrieve_document",
        description="Gets collection id and document id and returns the document record.",
    ),
    ## Method: partial_update
    patch=extend_schema(request=None,responses={200: None},
        description="Gets collection id and document id and renames the document with the given document id.",
    ),
    ## Method: destroy
    delete=extend_schema(request=None,responses={200: None},
        description="Gets collection id and document id and deletes the document with the given document id.",
    ),
)
class SharesViewDetail(SharesView):
    http_method_names = ["get", "patch", "delete"]

##############################################
## Shares
##############################################
@method_decorator(ensure_csrf_cookie, name='dispatch')
@extend_schema_view(
    ## Method: list
    get=extend_schema(request=None,responses={200: None},operation_id="export_all_collections",
        description="Exports all Collections the user has access to (owned and shared). Requires an authenticated user.",
    ),
)
class ExportAllCollectionsView(MongoDBAPIView, SQLDBAPIView):
    """
    Exports all user Collections
    """
    http_method_names = ["get"]
    db_name = 'annotations'

    # List all instances. (GET)
    def list(self, request):
        self.ensureAuthenticatedUser(request)
        result = []
        annotations = self.annotations
        for collection in self.getCollections(request.user):
            data = model_to_dict(collection)
            # for attr, value in collection.__dict__.items():
            #     if not attr == "_state":
            #         if (attr == "owner_id_id"):
            #             attr = "owner_id"
            #         data[attr] = value
            documents = self.getCollectionDocuments(request.user, collection)
            doc_records = []
            doc_record  = {}
            for document in documents:
                doc_record = model_to_dict(document)
                doc_record['data_image']  = doc_record['data_image'].url if doc_record['data_image'].name else None
                doc_record['data_file']   = doc_record['data_file'].url  if doc_record['data_file'].name  else None
                ## Normalise newlines, as expected by codemirror:
                ##   lineSeparator: string|null
                ##   Explicitly set the line separator for the editor. By default (value null),
                ##   the document will be split on CRLFs as well as lone CRs and LFs,
                ##   and a single LF will be used as line separator in all output
                doc_record['text']        = self.normaliseNewlines(doc_record['text'])
                doc_record['data_text']   = self.normaliseNewlines(doc_record['data_text'])
                doc_record["annotations"] = self.mongodb_find({"document_id": document.pk})
                doc_records.append(doc_record)
                doc_record = {}
            data["documents"] = doc_records
            result.append(data)
        return result
        # response = JsonResponse(data={"success": True, "message": "ok", "data": result},
        #                         status=status.HTTP_200_OK, encoder=ExtendedJSONEncoder)
        # datetime_str = timezone.now().strftime("%Y-%m-%d-%H-%M-%S")
        # response['Content-Disposition'] = f'attachment; filename="ExportedCollections-{datetime_str}.json"'
        # return response
