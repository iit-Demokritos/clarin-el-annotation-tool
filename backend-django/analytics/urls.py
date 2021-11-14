from django.urls import path, re_path

from .views import *

urlpatterns = [
    path('find',      AnnotationsFindView.as_view(),      name='annotations_find'),
    path('aggregate', AnnotationsAggregateView.as_view(), name="annotations_aggregate")
]
