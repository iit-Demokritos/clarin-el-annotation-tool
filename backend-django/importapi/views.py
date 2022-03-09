from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from clarin_backend.models import Collections, Documents
from clarin_backend.serializers import CollectionsSerializer, DocumentsSerializer

from newspaper import Article

class ImportDocumentFromURLView(APIView):
    """
    Create a new Document, through importing from a URL.
    """
    
    authentication_classes = [] #disables authentication
    permission_classes     = [] #disables permission

    keys = ["u", "p", "url", "col"]

    def validate(self, request):
        for k in self.keys:
            if not k in request.query_params:
                return Response(
                  data = {
                    "success": False,
                    "detail": f"Required parameter \"{k}\" is missing.",
                    "error":  f"Required parameter \"{k}\" is missing.",
                    "data": None
                  },
                  status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return None

    def authenticate(self, request):
        # Authenticate the user from "u" & "p" parameters...
        username = request.query_params['u']
        password = request.query_params['p']
        # print("Username:", username, ", password:", password)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return user
        else:
            # Return an 'invalid login' error message.
            return Response(
                  data = {
                    "success": False,
                    "detail": "Authentication credentials are wrong.",
                    "error":  "Authentication credentials are wrong.",
                    "data": None
                  },
                  status=status.HTTP_401_UNAUTHORIZED
                )
    def create_collection(self, request, user):
        name = request.query_params['col']
        if not name:
            return None
        collection = Collections.objects.filter(owner_id=user, name=name)
        if collection.exists():
            return collection[0]
        ## The collections does not exist, create a new one...
        collection = Collections(name=name, encoding="UTF-8", handler="none", owner_id=user)
        collection.save()
        return collection
        # return Response(
        #   data = {
        #     "success": False,
        #     "detail": f"Collection \"{name}\" does not exist.",
        #     "error":  f"Collection \"{name}\" does not exist.",
        #     "data": None
        #   },
        #   status=status.HTTP_500_INTERNAL_SERVER_ERROR
        # )

    def create_document(self, request, user, collection, article):
        name = article.title + ".txt"
        # Try to find an unused name...
        document = Documents.objects.filter(name=name, collection_id=collection)
        v = 1
        while (document.exists()):
            name = article.title + ".txt_" + str(v)
            document = Documents.objects.filter(name=name, collection_id=collection)
            v += 1
        print("Name:", name)
        # We have a unique name, create a document...
        url = request.query_params['url']
        text = article.title + "\n\n" + article.text + "\n\n" + url
        document = Documents(name=name,
                             external_name=url,
                             type="text",
                             text="\n".join(text.splitlines()),
                             handler="none",
                             encoding="UTF-8",
                             owner_id=user,
                             updated_by=user.email,
                             collection_id=collection)
        document.save()
        return document

    def parse(self, request):
        url = request.query_params['url']
        if "lang" in request.query_params:
            language = request.query_params['lang']
        else:
            language = "en"

        # print(f"URL: ({language})", url)
        article = Article(url, language=language)
        article.download()
        article.parse()
        if not (article.title and article.text):
            return Response(
              data = {
                "success": False,
                "detail": "Cannot parse article.",
                "error":  "Cannot parse article.",
                "data": None
              },
              status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return article

    def get(self, request):
        r = self.validate(request)
        if isinstance(r, Response):
            return r
        user = self.authenticate(request)
        if isinstance(user, Response):
            return user
        # Get the article...
        article = self.parse(request)
        if isinstance(article, Response):
            return article

        #print("Title:", article.title)
        #print(article.text)
        collection = self.create_collection(request, user)
        if isinstance(collection, Response):
            return collection
        document = self.create_document(request, user, collection, article)
        if isinstance(document, Response):
            return document
        data = {
                "id":                    document.id,
                "collection_id":         document.collection_id.pk,
                "name":                  document.name,
                "external_name":         document.external_name,
                "type":                  document.type,
                "text":                  document.text,
                "data_text":             document.data_text,
                "data_binary":           document.data_binary,
                "encoding":              document.encoding,
                "handler":               document.handler,
                "visualisation_options": document.visualisation_options,
                "owner_id":              document.owner_id.pk,
                "owner_email":           document.owner_id.email,
                "metadata":              document.metadata,
                "version":               document.version,
                "updated_by":            document.updated_by,
                "created_at":            document.created_at,
                "updated_at":            document.updated_at
            }

        return Response(
            data={"success": True, "data": data},
            status=status.HTTP_200_OK
        )
