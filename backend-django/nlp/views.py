from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from clarin_backend.models import Collections, Documents
from .pipelines import *

import requests
import json
from clarin_backend.sql_views import SQLDBAPIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.forms.models import model_to_dict

class GPUInfoView(APIView):
    """
    Return information about the available GPUs in the system.
    """

    authentication_classes = [] #disables authentication
    permission_classes     = [] #disables permission

    def get(self, request):
        return Response(data={"success": True, "data": gpu_info()},
                            status=status.HTTP_200_OK)

class ModelApplyNERCView(APIView):
    """
    Apply a model of type "NERC", which essentially marks text segments.
    """

    authentication_classes = [] #disables authentication
    permission_classes     = [] #disables permission

    keys = ["model", "data"]

    def validate(self, request):
        for k in self.keys:
            if (not k in request.query_params) and (not k in request.data):
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

    def get(self, request):
        pass

    def post(self, request):
        r = self.validate(request)
        if isinstance(r, Response):
            return r
        print(request.data['model'])
        print(request.data['data'])
        adu = TransformersPipelineNERC(model_name=request.data['model'])
        return Response(data={"success": True, "data": adu.apply(request.data['data'])},
                            status=status.HTTP_200_OK)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class ModelApplyExternalEndpointView(SQLDBAPIView):
    """
    Apply a model through an external endpoint (URL).
    """

    # authentication_classes = [] #disables authentication
    # permission_classes     = [] #disables permission

    keys = ["endpoint", "doc"]

    def validate(self, request):
        for k in self.keys:
            if (not k in request.query_params) and (not k in request.data):
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

    def get(self, request):
        pass

    def post(self, request):
        r = self.validate(request)
        if isinstance(r, Response):
            return r
        doc        = request.data['doc']
        collection = self.getCollection(request.user, doc["collection_id"])
        document   = Documents.objects.get(id=doc["id"])
        doc_record = model_to_dict(document)
        payload = {
          "links":  [],
          "texts":  [self.normaliseNewlines(doc_record['text'])],
          "config": {}
        }
        response = requests.post(request.data['endpoint'],
                                 json = payload)
        if response.ok:
            res = json.loads(response.content)
            return Response(data={"success": True,
                                  "data": res['documents'][0]['annotations']['ADUs']},
                                status=status.HTTP_200_OK)
        else:
            return Response(
                  data = {
                    "success": False,
                    "detail": response.content,
                    "error":  response.content,
                    "data": None
                  },
                  status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
