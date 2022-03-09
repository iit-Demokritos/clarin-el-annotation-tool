"""DjangoClarin URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include

from django.views import static
from django.conf import settings

urlpatterns = [
    path('admin/',         admin.site.urls),
    path('analytics/',     include('analytics.urls')),
    path('drag_and_drop/', include('drag_and_drop.urls')),
    path('openapi/',       include('openapi.urls')),
    path('importapi/',     include('importapi.urls')),
    re_path('^assets/(?P<path>.*)$', static.serve, {'document_root': settings.BASE_DIR / "static" / "assets"}),
    path('',               include('clarin_backend.urls')) #change clarin to /?
]
