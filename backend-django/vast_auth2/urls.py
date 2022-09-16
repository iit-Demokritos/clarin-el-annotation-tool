# -*- coding: utf-8 -*-
from allauth.socialaccount.providers.oauth2.urls import default_urlpatterns

from .provider import VASTAuth2Provider

urlpatterns = default_urlpatterns(VASTAuth2Provider)
