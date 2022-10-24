from datetime import datetime

from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class Users(AbstractUser):
    #username = models.CharField("name", max_length=255, unique=True, blank=False)
    email = models.EmailField('email', unique=True)
    permissions=models.TextField("permissions", null=True, default=None)
    first_name = models.CharField("first_name", max_length=255, null=True, default=None, blank=False)
    last_name = models.CharField("last_name", max_length=255, null=True, default=None)
    last_login = models.DateTimeField("last_login", null=True, default=None)
    created_at = models.DateTimeField("created_at",default=datetime.today)
    updated_at = models.DateTimeField("updated_at",default=datetime.today)
    USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username']
    REQUIRED_FIELDS = []

    class Meta:
        managed = True
        db_table = "users"


class Collections(models.Model):
    name = models.CharField("name", max_length=255)
    encoding = models.CharField("encoding", max_length=255)
    handler = models.CharField("handler", max_length=255)
    created_at = models.DateTimeField("created_at",default=datetime.today)
    updated_at = models.DateTimeField("updated_at", default=datetime.today)
    owner_id = models.ForeignKey(Users, on_delete=models.CASCADE)

    class Meta:
        managed = True
        db_table = "collections"


def user_collection_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<collection_id>/<filename>
    return 'user_{0}/{1}/{2}'.format(instance.owner_id.id, instance.collection_id.id, filename)

class Documents(models.Model):
    name          = models.CharField("name",                  max_length=255)
    external_name = models.CharField("external_name",         max_length=255)
    text          = models.TextField("text")
    type          = models.CharField("type",                  max_length=128, null=True, default=None)  # medium text
    data_text     = models.TextField("data_text",             null=True, default=None)
    data_binary   = models.BinaryField("data_binary",         null=True, default=None)
    data_file     = models.FileField(upload_to=user_collection_directory_path,  max_length=255, null=True, default=None, blank=True)  # This uses a function
    data_image    = models.ImageField(upload_to=user_collection_directory_path, max_length=255, null=True, default=None, blank=True)  # This uses a function
    data_url      = models.URLField(max_length=512,           null=True, default=None, blank=True)
    visualisation_options = \
                    models.TextField("visualisation_options", null=True, default=None)
    metadata      = models.TextField("metadata",              null=True, default=None)
    encoding      = models.CharField("encoding",              max_length=20)
    handler       = models.CharField("handler",               max_length=256, null=True, default=None)
    created_at    = models.DateTimeField("created_at",        default=datetime.today)
    updated_at    = models.DateTimeField("updated_at",        default=datetime.today)
    version       = models.IntegerField("version",            default=1)
    updated_by    = models.CharField("updated_by",            max_length=255)
    owner_id      = models.ForeignKey(Users,                  on_delete=models.CASCADE)
    collection_id = models.ForeignKey(Collections,            on_delete=models.CASCADE)

    class Meta:
        managed = True
        db_table = "documents"


class OpenDocuments(models.Model):

    created_at = models.DateTimeField("created_at", default=datetime.today)
    updated_at = models.DateTimeField("updated_at", default=datetime.today)
    db_interactions = models.IntegerField("db_interactions")
    annotator_type = models.CharField("annotator_type", max_length=255)
    #user_id = models.IntegerField(primary_key=True)
    user_id = models.ForeignKey(Users, on_delete=models.CASCADE)
    #user_id = models.
    collection_id = models.ForeignKey(Collections, on_delete=models.CASCADE)
    document_id = models.ForeignKey(Documents, on_delete=models.CASCADE)

    class Meta:
        managed = True
        db_table = "open_documents"


class SharedCollections(models.Model):
    confirmed = models.SmallIntegerField("confirmed",default=0)
    confirmation_code = models.CharField("confirmation_code", max_length=255,null=True, default=None)
    created_at = models.DateTimeField("created_at", default=datetime.today)
    updated_at = models.DateTimeField("updated_at", default=datetime.today)
    collection_id = models.ForeignKey(Collections, on_delete=models.CASCADE)
    fromfield =  models.ForeignKey(Users, on_delete=models.CASCADE,null=True,related_name="fromfield",to_field='email')
    tofield= models.ForeignKey(Users, on_delete=models.CASCADE,null=True,related_name="tofield",to_field='email')

    class Meta:
        managed = True
        db_table = "shared_collections"


# class AnnotationSchemas(models.Model):
#     xml = models.TextField("xml")
#     owner_id = models.ForeignKey(Users,
#                                         on_delete=models.SET_NULL, null=True)
#     language = models.CharField("language", max_length=255)
#     annotation_type = models.CharField("annotation_type", max_length=255, null=True, default=None)
#     attribute = models.CharField("attribute", max_length=255)
#     alternative = models.CharField("alternative", max_length=255)
#     created_at = models.DateTimeField("created_at", default=datetime.now)
#     updated_at = models.DateTimeField("updated_at", default=datetime.now)
#
#     class Meta:
#         db_table = "annotation_schemas"


class ButtonAnnotators(models.Model):
    user_id = models.ForeignKey(Users,
                                       on_delete=models.CASCADE)
    language = models.CharField("language", max_length=255, null=True, default=None)
    annotation_type = models.CharField("annotation_type", max_length=255, null=True, default=None)
    attribute = models.CharField("attribute", max_length=255, null=True, default=None)
    alternative = models.CharField("alternative", max_length=255, null=True, default=None)
    created_at = models.DateTimeField("created_at",  default=datetime.today)
    updated_at = models.DateTimeField("updated_at",  default=datetime.today)

    class Meta:
        db_table = "button_annotators"


class CoreferenceAnnotators(models.Model):
    user_id = models.ForeignKey(Users,
                                       on_delete=models.CASCADE)
    language = models.CharField("language", max_length=255, null=True, default=None)
    annotation_type = models.CharField("annotation_type", max_length=255, null=True, default=None)
    alternative = models.CharField("alternative", max_length=255, null=True, default=None)
    created_at = models.DateTimeField("created_at",  default=datetime.today)
    updated_at = models.DateTimeField("updated_at",  default=datetime.today)

    class Meta:
        db_table = "coreference_annotators"
