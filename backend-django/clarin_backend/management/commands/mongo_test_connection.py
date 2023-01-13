from django.core.management.base import BaseCommand
from pymongo import MongoClient
from django.conf import settings

class Command(BaseCommand):
    """Django command to check MONGO DB authentication"""

    def handle(self, *args, **kwargs):
        hostname    = settings.MONGO_DB_HOST
        port_number = settings.MONGO_DB_PORT
        db_auth     = settings.MONGO_DB_AUTH
        user        = settings.MONGO_USERNAME
        password    = settings.MONGO_PASSWORD
        db_name     = settings.MONGO_DATABASE

        connection_str  = f"mongodb://{user}:{password}@{hostname}:{port_number}/?authSource={db_auth}"
        connection_str2 = f"mongodb://{user}:{password[:4]}...@{hostname}:{port_number}/?authSource={db_auth}"
        mongoclient = None
        while not mongoclient:
            try:
                self.stdout.write(f"Connecting to MONGO DB:")
                self.stdout.write(f"> \"{connection_str2}\"")
                mongoclient = MongoClient(connection_str)
                print(mongoclient)
            except Exception as ex:
                self.stdout.write(f"Error while connecting to: \"{connection_str}\"")
                self.stdout.write(ex)
                time.sleep(1)
        self.stdout.write(self.style.SUCCESS('Database available'))
        try:
            self.stdout.write(f"Connecting to database: \"{db_name}\"...")
            db_handle = mongoclient[db_name]
        except Exceptions as ex:
            self.stdout.write(ex)
        print("DB Handle:", db_handle)
        self.stdout.write("Getting Collections:")
        for name in db_handle.list_collection_names():
            print(" -", name)
