from django.urls import path, re_path

from .views import *

urlpatterns = [
    # Import the text of a document into a collection...
    path('document-from-url', ImportDocumentFromURLView.as_view(), name='import_document_from_url'),
]
