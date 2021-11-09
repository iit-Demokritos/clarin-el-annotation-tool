# Code from:
# https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej

from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

def setJWTCookie(response, access_token):
    response.set_cookie(
        key      = settings.SIMPLE_JWT['AUTH_COOKIE'], 
        value    = access_token,
        expires  = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
        secure   = settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
        httponly = settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
        samesite = settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE']
    )
    return response

class CustomAuthentication(JWTAuthentication):
    
    def authenticate(self, request):
        header = self.get_header(request)
        
        if header is None:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
            # print("NO  Authenication Header: Using cookie:", raw_token)
        else:
            raw_token = self.get_raw_token(header)
            # print("YES Authenication Header: Using HEADER:", raw_token)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        # print("USER:", self.get_user(validated_token), ", Validated Token:", validated_token)
        return self.get_user(validated_token), validated_token
