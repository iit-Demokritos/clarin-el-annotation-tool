from django.shortcuts import render
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.schemas.openapi import SchemaGenerator

@authentication_classes([])
@permission_classes([])
class PublicSchemaGenerator(SchemaGenerator):
    pass
