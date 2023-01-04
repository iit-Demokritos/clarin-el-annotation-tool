from django.urls import path, re_path

from .views import *

try:
    from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
    import torch

    urlpatterns = [
        # Import the text of a document into a collection...
        path('gpu/info',                      GPUInfoView.as_view(),                    name='gpu_info'),
        path('model/apply/nerc',              ModelApplyNERCView.as_view(),             name='model_apply_nerc'),
        path('model/apply/external_endpoint', ModelApplyExternalEndpointView.as_view(), name='model_apply_external_endpoint'),
    ]
except ImportError as err:
    print("Django app nlp/urls.py: Cannot load modules:", err)
    urlpatterns = []
