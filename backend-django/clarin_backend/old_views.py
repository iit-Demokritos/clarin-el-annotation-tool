'''
@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleDocuments(APIView):

    def get(self, request, collection_id):
        try:
            collection = Collections.objects.get(pk=collection_id)
            documents = Documents.objects.filter(collection_id=collection)
            docs = []
            for item in documents:
                docs.append({"owner_email": (item.owner_id).email, "id": item.id, "type": item.type, "name": item.name, "text": item.text, "data_text": item.data_text,
                             "data_binary": None, "handler": item.handler, "visualisation_options": item.visualisation_options, "metadata": item.metadata, "external_name": item.external_name,
                             "encoding": item.encoding, "version": item.version, "owner_id": (item.owner_id).pk, "collection_id": (item.collection_id).pk, "updated_by": item.updated_by, "created_at": item.created_at,
                             "updated_at": item.updated_at})
        except Exception as ex:
            print("HandleDocuments(get)"+str(ex))
            return Response(data={"HandleDocuments :" + str(ex)}, status=status.HTTP_404_NOT_FOUND)
        return Response(data={"success": True, "data": docs}, status=status.HTTP_200_OK)

    def post(self, request, collection_id):
        new_data = {}
        try:
            data = request.data["data"]
            owner = Users.objects.get(email=request.user)
            new_data["name"] = data["name"]
            new_data["external_name"] = data["external_name"]
            new_data["type"] = None
            if ("type" in data and data["type"] is not None):

                new_data["type"] = data["type"].lower()
            new_data["metadata"] = None
            if ("metadata" in data):
                new_data["metadata"] = data["metadata"]
            new_data["data_text"] = None
            if ("data_text" in data):
                new_data["data_text"] = data["data_text"]
            new_data["version"] = 1
            if ("version" in data):
                new_data["version"] = data["version"]
            new_data["visualisation_options"] = None
            c = Collections.objects.get(pk=collection_id)
            d = Documents.objects.filter(
                name=new_data["name"], external_name=new_data["external_name"], collection_id=c)
            v = 1
            name = new_data["name"]
            ext_name = data["external_name"]
            while(d.exists()):
                new_data["name"] = name+str(v)
                new_data["external_name"] = ext_name + str(v)
                d = Documents.objects.filter(name=new_data["name"], external_name=new_data["external_name"],
                                             collection_id=c)
                v = v+1

            new_data["text"] = data["text"]
            if (new_data["type"] == "tei xml"):
                if ("visualisation_options" in data):
                    new_data["visualisation_options"] = data["visualisation_options"]

                else:
                    new_data["data_text"] = data["text"]
                    handler = HandlerClass(new_data["text"], "tei")
                    vo_json = handler.apply()["documents"][0]
                    new_data["text"] = vo_json["text"]
                    new_data["visualisation_options"] = json.dumps(
                        vo_json["info"])

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

            if("updated_by" in data):
                u = Users.objects.get(email=data["updated_by"])
                new_data["updated_by"] = u.email
            else:
                new_data["updated_by"] = owner.email
        except Exception as ex:
            print("HandleDocuments (POST):" + str(ex))
            return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)

        serializer = DocumentsSerializer(data=new_data)
        if serializer.is_valid():
            instancedoc = serializer.save()
            return Response(data={"success": True, "collection_id": collection_id, "document_id": instancedoc.pk})
        print(serializer.errors)
        return Response(data={"success": False}, status=status.HTTP_400_BAD_REQUEST)


# @method_decorator(ensure_csrf_cookie, name='dispatch')
# class HandleDocument(APIView):
# 
#     def delete(self, request, collection_id, document_id):
#         try:
#             document = Documents.objects.filter(id=document_id)
#             if not document.exists():
# 
#                 return Response(data={"deleted": False}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as ex:
#             print("HandleDocument (delete):" + str(ex))
#             return Response(data={"deleted": False}, status=status.HTTP_400_BAD_REQUEST)
#         document.delete()
#         return Response(data={"success": True}, status=status.HTTP_200_OK)
# 
#     def get(self, request, collection_id, document_id):
#         try:
#             print("HELLLLLO")
#             collection = Collections.objects.get(id=collection_id)
#             document   = Documents.objects.get(id=document_id)
#             user       = Users.objects.get(email=request.user)
#             opendocument=OpenDocuments.objects.filter(collection_id = collection, document_id   = document,db_interactions__gt = 0).extra(
#                 select={'val': "SELECT shared_collections.id FROM shared_collections WHERE shared_collections.collection_id_id =open_documents.collection_id_id"})
#             print(opendocument.values())
#             #print(OpenDocuments.objects \
#              #   .select_related('user_id') \
#                 #.filter(collection_id = collection, 
#                 #        document_id   = document,
#                 #        db_interactions__gt = 0) \
#                # .query)
# 
# 
#             doc_record = model_to_dict(document)
#             doc_record["is_opened"] = False
#             # is_opened = OpenDocuments.objects \
#             #     .select_related('shared_collections') \
#             #     .filter(collection_id = collection, 
#             #             document_id   = document,
#             #             db_interactions__gt = 0) \
#             #     .filter( Q(user_id = user) |
#             #             (Q(fromfield = user) & Q(confirmed = 1)) |
#             #             (Q(tofield   = user) & Q(confirmed = 1))) \
#             #     .count()
#             is_opened = 0
#             # opendocument_length = OpenDocuments.objects.filter(
#             #     document_id=document, collection_id=collection).count()
#             if (is_opened > 0):
#                 doc_record["is_opened"] = True
# 
#         except Exception as ex:
#             print("HandleDocument (get):" + str(ex))
#             return Response(data={"HandleDocument(get) :" + str(ex)}, status=status.HTTP_404_NOT_FOUND)
#         return Response(data={"success": True, "data": doc_record}, status=status.HTTP_200_OK)

''''

'''
@method_decorator(ensure_csrf_cookie, name='dispatch')
class SaveTempAnnotationView(APIView):
    def get(self, request, collection_id, document_id):
        records = []
        try:
            annotations = get_collection_handle(db_handle, "annotations_temp")
            cid = int(collection_id)
            did = int(document_id)
            getfilter = {"collection_id": cid, "document_id": did}
            getquery = annotations.find(getfilter)
            for item in getquery:
                item["_id"] = str(item["_id"])
                records.append(item)
                
            #if (len(records) == 0):
             #   stored_annotations = get_collection_handle(
              #      db_handle, "annotations")
               # getquery = stored_annotations.find(getfilter)
                #for item in getquery:
                 #   item["_id"] = str(item["_id"])
                  #  annotations.insert_one(item)
                   # records.append(item)
                    
        except Exception as ex:
            print("SaveTempAnnotationView (get):" + str(ex))
            return Response(data={"success": True, "data": records},
                            status=status.HTTP_200_OK)

        return Response(data={"success": True, "data": records},

                        status=status.HTTP_200_OK)

    def post(self, request, collection_id, document_id):

        try:
            collection = Collections.objects.get(pk=collection_id)
            document = Documents.objects.get(pk=document_id)
            user = Users.objects.get(email=request.user)
        except Exception as ex:
            print("SaveTempAnnotationView (post):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        annotations_temp = get_collection_handle(db_handle, "annotations_temp")

        if type(request.data["data"]) == list:
            for item in request.data["data"]:
                getquery = annotations_temp.find({"_id": item["_id"]})
                if(getquery.count() == 0):
                    item["_id"] = ObjectId(item["_id"])
                    annotations_temp.insert_one(item)
            opendocument = (OpenDocuments.objects.filter(
                collection_id=collection, document_id=document, user_id=user.pk)).get()
            opendocument.db_interactions = opendocument.db_interactions + \
                len(request.data["data"])

        if type(request.data["data"]) == dict:
            data = request.data["data"]
            data["_id"] = ObjectId(data["_id"])
            data["updated_by"] = user.email
            data["created_at"] = datetime.now()
            data["updated_at"] = datetime.now()
            annotations_temp.insert_one(data)
            opendocument = (OpenDocuments.objects.filter(
                collection_id=collection, document_id=document, user_id=user.pk)).get()
            opendocument.db_interactions = opendocument.db_interactions + 1
            opendocument.save()
        return Response(data={"success": True, "db_interactions": opendocument.db_interactions})

'''
'''
@method_decorator(ensure_csrf_cookie, name='dispatch')
class HandleTempAnnotationView(APIView):
    def delete(self, request, collection_id, document_id, param):
        try:
            collection = Collections.objects.get(pk=collection_id)
        except Exception as ex:
            print("HandleTempAnnotationView (delete1):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        try:
            document = Documents.objects.get(pk=document_id)
        except Exception as ex:
            print("HandleTempAnnotationView (delete2):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        try:
            annotations_temp = get_collection_handle(
                db_handle, "annotations_temp")
            cid = int(collection_id)
            did = int(document_id)
            if param is None:
                annotations_temp.delete_many(
                    {"collection_id": cid, "document_id": did})
            ty = "id"

            if "_" in param:
                ty = "type"
            if ty == "id":
                # fake delete
                r = annotations_temp.find({"_id": ObjectId(param)})
                for r1 in r:
                    filter = {"_id": ObjectId(param)}
                    newvalues = {
                        "$set": {"updated_at": datetime.now(), "deleted_at": datetime.now()}}
                    annotations_temp.update_one(filter, newvalues)
                  # print(r1)
                  # annotations_temp.delete_one({"_id": ObjectId(param)})
            else:
               # filter =  {"collection_id": cid, "document_id": did, "annotator_id": param}
                #newvalues = {"$set": {"updated_at":datetime.now(),"deleted_at":datetime.now()}}
                #annotations_temp.update_many(filter, newvalues)
                annotations_temp.delete_many(
                    {"collection_id": cid, "document_id": did, "annotator_id": param})

            opendocument = (OpenDocuments.objects.filter(
                collection_id=collection, document_id=document))
            for od in opendocument:
                od.db_interactions = od.db_interactions+1
                od.save()
        except Exception as ex:
            print("HandleTempAnnotationView (delete3):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True})

    def put(self, request, collection_id, document_id, param):
        try:
            collection = Collections.objects.get(pk=collection_id)
            document = Documents.objects.get(pk=document_id)
            user = Users.objects.get(email=request.user)
        except Exception as ex:
            print("HandleTempAnnotationView (put1):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(e)}, status=status.HTTP_200_OK)
        try:
            annotations_temp = get_collection_handle(
                db_handle, "annotations_temp")
            filter = {"_id": ObjectId(param)}
            ann = annotations_temp.find_one(filter)
            data = request.data["data"]

            data["_id"] = ObjectId(data["_id"])
            data["updated_by"] = user.email
            data["updated_at"] = datetime.now()
            data["created_at"] = ann["created_at"]
            newvalues = {"$set": data}
            annotations_temp.update_one(filter, newvalues)
            opendocument = (
                OpenDocuments.objects.filter(collection_id=collection, document_id=document, user_id=user.pk)).get()
            opendocument.db_interactions = opendocument.db_interactions + 1
            opendocument.save()
        except Exception as e:
            print("HandleTempAnnotationView (put2):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True})

    def get(self, request, collection_id, document_id, param):
        records = []
        cid_int = int(collection_id)
        did_int = int(document_id)
        try:
            annotations_temp = get_collection_handle(
                db_handle, "annotations_temp")
            getfilter = {"collection_id": cid_int,
                         "document_id": did_int, "annotator_id": param}
            getquery = annotations_temp.find(getfilter)
            count = 0
            for item in getquery:
                if ("deleted_at" not in item.keys()):
                    item['_id'] = str(item['_id'])
                    records.append(item)

                #
                #if ("deleted_at" in item.keys()):
                 #      storeannotation=stored_annotations.find_one({"_id": ObjectId( item['_id'])})
                  #     if storeannotation is not None:
                   #         storeannotation["_id"]=str(storeannotation["_id"])
                    #        records.append(storeannotation)
                #else:
                 #   records.append(item)
                

            #records[:] = [d for d in records if (not  ("deleted_at" in d.keys()))]

            # else:

        except Exception as ex:
            print("HandleTempAnnotationView (get):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(ex)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True, "data": records},
                        status=status.HTTP_200_OK)
'''
'''
@method_decorator(ensure_csrf_cookie, name='dispatch')
class DeleteSavedAnnotations(APIView):
    def delete(self, request, collection_id, document_id, Button_Annotator_name):
        records = []
        try:
            annotations = get_collection_handle(db_handle, "annotations")
            getfilter = {"collection_id": int(collection_id), "document_id": int(document_id),
                         "annotator_id": Button_Annotator_name}
            getquery = annotations.find(getfilter)
            for item in getquery:
                annotations.delete_one(item)
        except Exception as e:
            print("DeleteSavedAnnotations (delete):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(e)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class DocumenAnnotationView(APIView):
    def get(self, request, collection_id, document_id):

        records = []
        try:
            annotations = get_collection_handle(db_handle, "annotations")
            cid = int(collection_id)
            did = int(document_id)
            getfilter = {"collection_id": cid, "document_id": did}
            getquery = annotations.find(getfilter)
            for item in getquery:
                item["_id"] = str(item["_id"])
                records.append(item)
        except Exception as ex:
            print("DocumenAnnotationView (get):" + str(ex))
            return Response(data={"success": True, "data": records},

                            status=status.HTTP_200_OK)
       # print(records)
        return Response(data={"success": True, "data": records},

                        status=status.HTTP_200_OK)

    def post(self, request, collection_id, document_id):
        try:
            annotations = get_collection_handle(db_handle, "annotations")
            data = request.data["data"]
            for item in data:
                record = annotations.find({"_id": item["_id"]})
                for annotation in record:
                    annotations.delete_one(annotation)
                item["_id"] = ObjectId(item["_id"])
                item["created_at"] = transformdate(item["created_at"])
                item["updated_at"] = transformdate(item["updated_at"])
                annotations.insert_one(item)
        except Exception as ex:
            print("DocumenAnnotationView (post):" + str(ex))
            return Response(data={"success": False, "message": "An error occured." + str(ex)},
                            status=status.HTTP_200_OK)
        return Response(data={"success": True})

'''