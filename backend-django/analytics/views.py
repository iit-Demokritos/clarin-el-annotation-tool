from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from clarin_backend import utils
from bson.objectid import ObjectId
from drf_spectacular.utils import extend_schema_view, extend_schema
mongodb_client          = utils.mongo_client
mongodb_db_clarin       = utils.db_handle
_mongodb_db_annotations = None

def mongodb_encode_id(id):
    if type(id) is str:
        # Decide if it is a UUID or an ObjectID:
        if '-' in id:
            # Leave it as a string...
            return id
        else:
            return ObjectId(id)

def mongodb_db_annotations():
    global _mongodb_db_annotations
    if _mongodb_db_annotations is None:
        _mongodb_db_annotations = utils.get_collection_handle(mongodb_db_clarin, "annotations")
    return _mongodb_db_annotations

def mongodb_doc_fix_id(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    # print("doc:", doc)
    return doc

def mongodb_db_annotations_find(request):
    query      = request.data.get('q')
    projection = request.data.get('p')
    return map(mongodb_doc_fix_id, mongodb_db_annotations().find(query, projection))

def mongodb_db_annotations_find_by_id(request):
    _id        = request.data.get('id')
    return map(mongodb_doc_fix_id, mongodb_db_annotations().find({'_id': mongodb_encode_id(_id)}))

def mongodb_db_annotations_aggregate(request):
    query      = request.data.get('q')
    return mongodb_db_annotations().aggregate(query)

class AnnotationsFindView(APIView):
    @extend_schema(request=None,responses={200: None},description="Gets a mongodb query, a set of  projection fields and retrieves from the annotations collection the records that are matched.")   
    def post(self, request):
        cursor = mongodb_db_annotations_find(request)
        return Response(
            data={"success": True, "data": list(cursor)},
            status=status.HTTP_200_OK
        )

class AnnotationsFindByIdView(APIView):
    @extend_schema(request=None,responses={200: None},description="Gets an annotation id and returns the annotation data.")   
    def post(self, request):
        cursor = mongodb_db_annotations_find_by_id(request)
        return Response(
            data={"success": True, "data": list(cursor)},
            status=status.HTTP_200_OK
        )

class AnnotationsAggregateView(APIView):
    def post(self, request):
        cursor = mongodb_db_annotations_aggregate(request)
        return Response(
            data={"success": True, "data": list(cursor)},
            status=status.HTTP_200_OK
        )
