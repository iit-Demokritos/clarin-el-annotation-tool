from django.urls import path, re_path

from .views import *

urlpatterns = [
    path('copy',    DocumentCopyViewList.as_view(),      name='document_copy'),
]
