from django.shortcuts import render
from rest_framework.views import APIView, View
from rest_framework.response import Response
from rest_framework import status
from clarin_backend import utils
from bson.objectid import ObjectId

mongodb_client         = utils.mongo_client
mongodb_db_clarin      = utils.db_handle
mongodb_db_annotations = utils.get_collection_handle(
    mongodb_db_clarin, "annotations")

def mongodb_doc_fix_id(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    # print("doc:", doc)
    return doc

def mongodb_db_annotations_find(request):
    query      = request.data.get('q')
    projection = request.data.get('p')
    return map(mongodb_doc_fix_id, mongodb_db_annotations.find(query, projection))

def mongodb_db_annotations_find_by_id(request):
    _id        = request.data.get('id')
    return map(mongodb_doc_fix_id, mongodb_db_annotations.find({'_id': ObjectId(_id)}))

def mongodb_db_annotations_aggregate(request):
    query      = request.data.get('q')
    return mongodb_db_annotations.aggregate(query)

class AnnotationsFindView(APIView):
    def post(self, request):
        cursor = mongodb_db_annotations_find(request)
        return Response(
            data={"success": True, "data": list(cursor)},
            status=status.HTTP_200_OK
        )

class AnnotationsFindByIdView(APIView):
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
