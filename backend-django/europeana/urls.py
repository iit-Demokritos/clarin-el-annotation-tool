from django.urls import path, re_path

from .views import *

urlpatterns = [
    # Import the text of a document into a collection...
    path('search', EuropeanaSearchView.as_view(), name='europeana-search'),
]
