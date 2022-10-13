# -*- coding: utf-8 -*-
import urllib.parse

from allauth.socialaccount import app_settings
from .provider import VASTAuth2Provider
from allauth.socialaccount.providers.oauth2.views import (
    OAuth2Adapter,
    OAuth2CallbackView,
    OAuth2LoginView,
)
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.socialaccount.models import SocialLogin
from django.urls import reverse
from django.shortcuts import redirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from rest_framework_simplejwt.tokens import RefreshToken
from DjangoClarin.authentication import setJWTCookie
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
import urllib.parse
import requests

class VASTAuth2OAuth2Adapter(OAuth2Adapter):
    provider_id = VASTAuth2Provider.id
    supports_state = True

    settings = app_settings.PROVIDERS.get(provider_id, {})
    provider_base_url = settings.get("AUTH_URL")

    access_token_url = "{0}/oauth2/access_token".format(provider_base_url)
    authorize_url    = "{0}/oauth2/authorize".format(provider_base_url)
    profile_url      = "{0}/userinfo".format(provider_base_url)

    # def get_callback_url(self, request, app):
    #     url = super().get_callback_url(request, app)
    #     callback_url = reverse(self.provider_id + "_callback")
    #     protocol = self.redirect_uri_protocol
    #     print("callback_url:", callback_url, protocol, request)
    #     print("get_callback_url:", app, url)
    #     print("absolute:", request.build_absolute_uri("/help"))
    #     return url

    def complete_login(self, request, app, token, response):
        # print(requests)
        extra_data = requests.get(
            self.profile_url,
            headers={"Authorization": f"Bearer {token.token}"}
        ).json()
        # print("==================================================", flush=True)
        # print(extra_data, flush=True)
        # print("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", flush=True)
        # extra_data = requests.post(
        #     self.profile2_url, auth=(app.client_id, app.secret), data={"token": token.token}
        # ).json()
        extra_data = {
            "user_id":    extra_data.get("sub"),
            "id":         extra_data.get("sub"),
            "username":   extra_data.get("email"),
            "email":      extra_data.get("email"),
            "first_name": extra_data.get("given_name"),
            "last_name":  extra_data.get("family_name"),
            "name":       extra_data.get("name"),
        }
        # print(extra_data, self.get_provider(), flush=True)

        sociallogin = self.get_provider().sociallogin_from_response(request, extra_data)
        # print("sociallogin:", sociallogin, sociallogin.state, flush=True)
        return sociallogin

class VASTAuth2OAuth2LoginView(OAuth2LoginView):
    def login(self, request, *args, **kwargs):
        # print("VASTAuth2OAuth2LoginView:", flush=True)
        # print("VASTAuth2OAuth2LoginView:", request.META, flush=True)
        result = super().login(request, *args, **kwargs)
        state = SocialLogin.state_from_request(request)
        # print("State:", state, flush=True);
        # print("User Authenticated:", request.user.is_authenticated, ", Session key:", request.session.session_key, flush=True)
        # print("CSRF Token:", request.META["CSRF_COOKIE"], flush=True)
        return result

class VASTAuth2OAuth2CallbackView(OAuth2CallbackView):
    def dispatch(self, request, *args, **kwargs):
        # print("VASTAuth2OAuth2CallbackView:", flush=True)
        # print("CSRF Token:", request.META["CSRF_COOKIE"], flush=True)
        # print("VASTAuth2OAuth2CallbackView:", request.META, flush=True)
        res = super().dispatch(request, *args, **kwargs)
        state = SocialLogin.state_from_request(request)
        # print("State:", state, flush=True);
        # print("Result:", res, flush=True);
        # print("User Authenticated:", request.user.is_authenticated, ", Session key:", request.session.session_key, flush=True)
        # print("CSRF Token:", request.META["CSRF_COOKIE"], flush=True)
        ##
        ## So, at this point we have logged in into Django, and we have a user.
        ## However, this is not enough in our case, as we do not use Django's session authentication!
        ## Our API is in DRF (Django Rest Framework), configured to only use rest_framework_simplejwt
        ## authentication (DjangoClarin.authentication.CustomAuthentication, which inherits from 
        ## rest_framework_simplejwt.authentication.JWTAuthentication, but also looks for a coockie
        ## with name settings.SIMPLE_JWT['AUTH_COOKIE']).
        ## Thus, we need to generate a JWT token pair, and store the access token in this cookie!
        if request.user.is_authenticated:
            refresh = RefreshToken.for_user(request.user)
            data = {"refresh": str(refresh), "access" : str(refresh.access_token)}
            setJWTCookie(res, data["access"])
        res.delete_cookie("messages")
        ## Add the keys to the Location url...
        url_parts = urllib.parse.urlparse(res['Location'])
        query = dict(urllib.parse.parse_qsl(url_parts.query))
        query.update(data)
        new_url = url_parts._replace(query=urllib.parse.urlencode(query)).geturl()
        # print("LOCATION:", res['Location'], "->", new_url)
        res['Location'] = new_url
        return res

# @receiver(user_logged_in)
# def my_callback_user_logged_in(sender, **kwargs):
#     print("=======> user_logged_in! user:", kwargs["user"].__dict__)
#     request = kwargs["request"]
#     print("User Authenticated:", request.user.is_authenticated, ", Session key:", request.session.session_key, flush=True)
#     print("CSRF Token:", request.META["CSRF_COOKIE"], flush=True)
# 
# 
# @receiver(user_logged_out)
# def my_callback_user_logged_out(sender, **kwargs):
#     print("=======> user_logged_out! user:", kwargs["user"].__dict__)
#     request = kwargs["request"]
#     print("User Authenticated:", request.user.is_authenticated, ", Session key:", request.session.session_key, flush=True)
#     print("CSRF Token:", request.META["CSRF_COOKIE"], flush=True)
# 
# @receiver(user_login_failed)
# def my_callback_user_login_failed(sender, **kwargs):
#     print("=======> user_login_failed! user:", kwargs["user"].__dict__)
#     request = kwargs["request"]
#     print("User Authenticated:", request.user.is_authenticated, ", Session key:", request.session.session_key, flush=True)
#     print("CSRF Token:", request.META["CSRF_COOKIE"], flush=True)

oauth2_login    = csrf_exempt(VASTAuth2OAuth2LoginView.adapter_view(VASTAuth2OAuth2Adapter))
oauth2_callback = VASTAuth2OAuth2CallbackView.adapter_view(VASTAuth2OAuth2Adapter)
