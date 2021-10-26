# # from django.test import TestCase
from pymongo import MongoClient


# # from django.core.mail import EmailMultiAlternatives
# # from django.core.mail import send_mail
# # from django.core import mail
# # from django.conf import settings
# # from django.test.utils import override_settings

import pandas as pd
# import os
# cwd = os.getcwd()
# print(cwd)
import datetime

def transformdate(datetime_str):
    datetime_parts=datetime_str.split("T")
   # print(datetime_parts)
    date_segment=datetime_parts[0]
    time_segment=((datetime_parts[1][0:len(datetime_parts[1])-1]).split("."))[0]
    print(date_segment)
    print(time_segment)
    date_parts=date_segment.split("-")
    date_parts[0]=int(date_parts[0])
    for i in range(1,len(date_parts)):
	    if(date_parts[i][0]=="0"):
		    date_parts[i]=date_parts[i][1:]
	    date_parts[i]=int(date_parts[i])

    time_parts=time_segment.split(":")
    for i in range(0,len(time_parts)):
	    if(time_parts[i][0]=="0"):
			    time_parts[i]=time_parts[i][1:]
	    time_parts[i]=int(time_parts[i])
    #print(date_parts)
    #print(time_parts)
    output_datetime= datetime.datetime(date_parts[0], date_parts[1], date_parts[2],time_parts[0],time_parts[1],time_parts[2])
    return output_datetime

datetime_str="2020-09-03T01:07:05Z"
x = transformdate(datetime_str)

print(x)





# #
# # @override_settings(EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend')
# # class EmailTestCase(TestCase):
# #     def setUp(self):
# #         self.recipients = [
# #             "petasis@iit.demokritos.gr",
# #             "petasisg@yahoo.gr",
# #             "antogramatzis@iit.demokritos.gr"
# #         ]
# #
# #     def test_email_send(self):
# #         print("HOST:", settings.EMAIL_HOST,    ", PORT:", settings.EMAIL_PORT)
# #         print("TLS:",  settings.EMAIL_USE_TLS, ", EMAIL_HOST_USER:", settings.EMAIL_HOST_USER)
# #         msg = EmailMultiAlternatives(subject="This is a test e-mail from Django!",
# #             body="E-mail body!",
# #             from_email=settings.DEFAULT_FROM_EMAIL,
# #             to=self.recipients)
# #         connection = msg.get_connection()
# #         print('connection:', connection)
# #         status = msg.send(fail_silently=False)
# #         print("status:", status)
# from bson import ObjectId
# from pymongo import MongoClient
#
#
# def get_clarindb():
#     mongoclient=MongoClient(host="localhost",port=27017)
#     clarindb=mongoclient["clarin"]
#     return clarindb, mongoclient
#
# def get_collection_handle(db_handle, collection_name):
#     return db_handle[collection_name]
#
#
# db_handle, mongo_client =get_clarindb()
# annotations = get_collection_handle(db_handle, "annotations")
# getfilter = {"collection_id": 78, "document_id": 3078}
# getquery = annotations.find(getfilter)
# print(getquery)
# for item in getquery:
#     print(str(item["_id"]))

# annotations_temp=get_collection_handle(db_handle, "annotations_temp")
# records=[
#     {"name":"Alex","gender":"M","age_group":1,"team_id":0},
#     {"name":"Nick","gender":"M","age_group":2,"team_id":0},
# {"name":"Vlad","gender":"M","age_group":1,"team_id":1},
# {"name":"Chen","gender":"M","age_group":3,"team_id":1},
# {"name":"Pat","gender":"M","age_group":3,"team_id":1},
# {"name":"Nil","gender":"M","age_group":2,"team_id":0},
# {"name":"Ogwu","gender":"M","age_group":2,"team_id":1},
# {"name":"Tania","gender":"F","age_group":1,"team_id":0},
# {"name":"Vicky","gender":"F","age_group":2,"team_id":0},
# {"name":"Lorena","gender":"F","age_group":3,"team_id":0},
# {"name":"Alicia","gender":"F","age_group":4,"team_id":0},
# {"name":"Paola","gender":"F","age_group":4,"team_id":0},
# {"name":"Mark","gender":"M","age_group":4,"team_id":1},
# ]
#
#
# myquery = { "gender": "F","age_group":4,"team_id":0 }
# #annotations.insert_many(records)
#
#
#
# #annotations.insert_many([{"name":"pan","surname":"pan"},{"name":"ping","surname":"pong"}])
# #annotations.delete_one({"_id":ObjectId("60a3833d605aaf5b7c343625")})
# # r={'_id': ObjectId('ffdgg'), 'name': 'Alicia', 'gender': 'F', 'age_group': 4, 'team_id': 1}
# # annotations.delete_one(r)
# filter = { 'name': 'pong' }
# newvalues = { "$set": { 'name': "Mark","qty":15 } }
# s1=annotations.update_one(filter, newvalues)
# print(s1.modified_count)
# #annotations.delete_many(myquery)
# records=annotations.find({})
# for x in records:
#     print(x)
# print("\n\n")
# # records=annotations.find({"_id":ObjectId("60a38f83c441f27117d206d0")})
# r={'_id': ObjectId('ffdgg'), 'name': 'Alicia', 'gender': 'F', 'age_group': 4, 'team_id': 1}
# annotations.insert_one(r)
# records=annotations.find({})
# for x in records:
#     print(x)

# for x in records:
#     records2=annotations_temp.find(x)
#     for y in records2:
#         annotations_temp.delete_one(y)
# lst=list(records)
# print(len(lst))
# for x in records:
#     annotations_temp.insert_one(x)
# # print("\n\n")
# records=annotations_temp.find({})
# for x in records:
#     print(x)
# # print(count)

