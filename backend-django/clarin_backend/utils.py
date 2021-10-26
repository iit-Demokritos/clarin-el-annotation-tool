from django.contrib.auth.tokens import PasswordResetTokenGenerator
from six import text_type
from pymongo import MongoClient
from django.conf import settings

class AppTokenGenerator(PasswordResetTokenGenerator):

    def _make_hash_value(self, user, timestamp):
        return (text_type(user.is_active) + \
                text_type(user.pk) + \
                text_type(timestamp))


account_activation_token = AppTokenGenerator()


class InvitationTokenGenerator(PasswordResetTokenGenerator):
    invitation_hash = None

    def make_my_hash_value(self, touser_pk, cid):
        InvitationTokenGenerator.invitation_hash = (text_type(touser_pk) + \
                                                    text_type(cid))

    def _make_hash_value(self, user, timestamp):
        return (text_type(user.is_active) + \
                text_type(user.pk) + \
                text_type(InvitationTokenGenerator.invitation_hash) + \
                text_type(timestamp))


invitation_token = InvitationTokenGenerator()


def get_clarindb():
    hostname = settings.MONGO_DB_HOST
    port_number=settings.MONGO_DB_PORT
    user=settings.MONGO_USERNAME
    password=settings.MONGO_PASSWORD
    db_name=settings.MONGO_DATABASE
    clarindb=None
    mongoclient=None
    try:
       # print(hostname)
        #print(port_number)
        #print(user)
        #print(password)
        #print(db_name)
        mongo_con="mongodb://"+user+":"+password+"@"+hostname+":"+str(port_number)
       # print(mongo_con)
        #print("mongodb://clarinel:CeimUgyediaskibwawEijWir@localhost:27017")
        mongoclient = MongoClient(mongo_con)
        clarindb = mongoclient["clarin"]
        #mongoclient = MongoClient(host=hostname, port=port_number,username=user,password=password,
      #  authSource=db_name)#?
        mongoclient.server_info()
    except Exception as ex:
            print(ex)


    #print(mongoclient
   # clarindb = mongoclient["clarin"]
    #print(clarindb)
    return clarindb, mongoclient


def get_collection_handle(db_handle, collection_name):
    print(db_handle[collection_name])
    return db_handle[collection_name]


db_handle, mongo_client = get_clarindb()
#annotations = get_collection_handle(db_handle, "annotations")
#annotations_temp = get_collection_handle(db_handle, "annotations_temp")
