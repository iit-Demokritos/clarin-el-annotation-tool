from django.shortcuts import render
from clarin_backend.utils import ErrorLoggingAPIViewList
from clarin_backend.mongodb_views import MongoDBAPIView
from clarin_backend.models import Users, Collections, Documents
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.forms.models import model_to_dict
from bson.objectid import ObjectId
import re
from drf_spectacular.utils import extend_schema_view, extend_schema
@method_decorator(ensure_csrf_cookie, name='dispatch')
class DocumentCopyView(MongoDBAPIView):
    http_method_names = ["post"]
    db_name = 'annotations'

    # Create a new instance. (POST)

    def create(self, request):
        did = request.data['document_id']
        cid = request.data['collection_id']
        # We should *copy* document did to collection cid.
        target_collection = self.getCollection(request.user, cid)
        document          = Documents.objects.get(id=did)
        origin_collection = self.getCollection(request.user, document.collection_id_id)
        # Documentation for copying model instances:
        # https://docs.djangoproject.com/en/4.0/topics/db/queries/#copying-model-instances
        document.pk = None
        document.collection_id = target_collection
        document.owner_id      = target_collection.owner_id
        document._state.adding = True
        #
        # Make sure the document name is unique in the new collection
        #
        # Check if old name has already a "_<number>", and remove it...
        parts = re.split('_(?=\\d+$)', document.name)
        name = parts[0]
        v = 1
        # Add an extension, untill the document is unique in collection...
        d = Documents.objects.filter(name=name, collection_id=target_collection)
        while(d.exists()):
            name = name + "_" + str(v)
            v += 1
            d = Documents.objects.filter(name=name, collection_id=target_collection)
        if name != document.name:
            document.name = name

        # Save the document...
        # This must come before updating the annotations, as we need the new document id...
        document.save()

        #
        # Copy annotations...
        #
        origin_annotations = list(self.db.find({'collection_id': origin_collection.pk,
                                                'document_id':   did}))
        # Create a new list, with new ids. Keep a map from old -> new id...
        old2new = {}
        for ann in origin_annotations:
            old2new[str(ann['_id'])] = ObjectId()
        # Iterate again over annotation, mapping id & values to new ids...
        target_annotations = []
        for ann in origin_annotations:
            # print("->", ann);
            new_id               = old2new[str(ann['_id'])]
            ann['_id']           = new_id
            ann['collection_id'] = cid
            ann['document_id']   = document.pk
            # Iterate over attribute values, and map annotation ids...
            for attr in ann['attributes']:
                if attr['value'] in old2new:
                    attr['value'] = str(old2new[attr['value']])
            # print("  ", ann);
            target_annotations.append(ann)

        # Save the annotations...
        self.db.insert(target_annotations)
        return {"success": True, "collection_id": cid, "document_id": document.pk}



@extend_schema_view(
    
    ## Method: create
    post=extend_schema(request=None,responses={200: None},
        description="Gets document id and collection id and copies the document to the collection with the given collection id along with its annotations."
        
    )
)
class DocumentCopyViewList(ErrorLoggingAPIViewList, DocumentCopyView):
     http_method_names = ["post"]
