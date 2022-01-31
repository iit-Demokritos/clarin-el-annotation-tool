from django.urls import path, re_path

# https://www.django-rest-framework.org/api-guide/schemas/
# https://hirelofty.com/blog/devops/auto-generate-swagger-docs-your-django-api/
from rest_framework.schemas import get_schema_view
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

from .views import *

title       = "Ellogon Web Annotation Tool"
description = "API for the back-end of the Ellogon Web Annotation Tool"
version     = "1.0.0"

urlpatterns = [
    # YOUR PATTERNS
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # path('openapi-schema.yml', get_schema_view(title=title, description=description, version=version,
    #     authentication_classes=[], permission_classes=[]
    # ), name='openapi-schema.yml'),
]
