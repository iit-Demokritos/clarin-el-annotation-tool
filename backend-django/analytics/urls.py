from django.urls import path, re_path

from .views import *

urlpatterns = [
    path('find',      AnnotationsFindView.as_view(),      name='annotations_find'),
    path('findById',  AnnotationsFindByIdView.as_view(),  name='annotations_find_by_id'),
    path('aggregate', AnnotationsAggregateView.as_view(), name="annotations_aggregate")
]
