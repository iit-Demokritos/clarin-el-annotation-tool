"""
Django settings for ellogon_annotation_tool project.

Generated by 'django-admin startproject' using Django 3.1.6.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

from datetime import timedelta
from pathlib import Path
import json
import os
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
# https://django-environ.readthedocs.io/en/latest/#django-environ
env = environ.Env(
    # set casting, default value
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    DEFAULT_FROM_EMAIL=(str, ''),
    DEFAULT_FROM_EMAIL_NO_REPLY=(str, ''),
    LANGUAGE_CODE=(str, 'en-us'),
    TIME_ZONE=(str, 'Europe/Athens'),
)
# reading .env file
environ.Env.read_env()

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# Raises django's ImproperlyConfigured exception if SECRET_KEY not in os.environ
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True
# False if not in os.environ
DEBUG = env('DEBUG')

ALLOWED_HOSTS = env('ALLOWED_HOSTS')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework', # add rest_framework
    'rest_framework_simplejwt.token_blacklist',
    'clarin_backend',
    'analytics',
    'drag_and_drop',
    'openapi',
    'drf_spectacular'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'DjangoClarin.middleware.XPoweredByMiddleware',
]

ROOT_URLCONF = 'DjangoClarin.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'),#os.path.join(BASE_DIR, 'clarinangular/clarin-angular/src')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'DjangoClarin.wsgi.application'

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases
DATABASES = {
    'default': env.db()
}

# REST
# https://www.django-rest-framework.org/
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'DjangoClarin.authentication.CustomAuthentication',
        #'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
        'DjangoClarin.renderers.TextEventStreamAPIRenderer',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Ellogon Web Annotation Tool',
    'DESCRIPTION': 'API for the back-end of the Ellogon Web Annotation Tool',
    'VERSION': '1.0.0',
    # OTHER SETTINGS
    #'PREPROCESSING_HOOKS': ['openapi.hooks.custom_preprocessing_hook']
}

# REST Simple JWT
# https://github.com/SimpleJWT/django-rest-framework-simplejwt
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':    timedelta(minutes=20), #minutes=20
    'REFRESH_TOKEN_LIFETIME':   timedelta(days=14), #days=14
    'ROTATE_REFRESH_TOKENS':    True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM':                'HS256',
    'SIGNING_KEY':              SECRET_KEY,
    'VERIFYING_KEY':            None,
    'AUTH_HEADER_TYPES':        ('Bearer', 'JWT'),
    'USER_ID_FIELD':            'id',
    'USER_ID_CLAIM':            'user_id',
    'AUTH_TOKEN_CLASSES':      ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM':         'token_type',

    # Custom settings from:
    # https://stackoverflow.com/questions/66247988/how-to-store-jwt-tokens-in-httponly-cookies-with-drf-djangorestframework-simplej
    'AUTH_COOKIE': 'access_token',  # Cookie name. Enables cookies if value is set.
    'AUTH_COOKIE_DOMAIN': None,     # A string like "example.com", or None for standard domain cookie.
    'AUTH_COOKIE_SECURE': False,    # Whether the auth cookies should be secure (https:// only).
    'AUTH_COOKIE_HTTP_ONLY' : True, # Http only cookie flag.It's not fetch by javascript.
    'AUTH_COOKIE_PATH': '/',        # The path of the auth cookie.
    'AUTH_COOKIE_SAMESITE': 'Lax',  # Whether to set the flag restricting cookie leaks on cross-site requests.
                                    # This can be 'Lax', 'Strict', or None to disable the flag.
}

# CSRF Protection
CSRF_USE_SESSIONS = False
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_NAME = 'XSRF-TOKEN'
CSRF_HEADER_NAME = 'X-XSRF-TOKEN'
CSRF_COOKIE_SECURE = True

# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = env('LANGUAGE_CODE')
TIME_ZONE = env('TIME_ZONE')
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_URL = '/static/'
# STATICFILES_DIRS = (
#     os.path.join(BASE_DIR, 'static'), os.path.join(BASE_DIR, 'clarinangular/clarin-angular/dist/clarin-angular')
# )
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Custom user model
AUTH_USER_MODEL = "clarin_backend.Users"
DEFAULT_AUTO_FIELD='django.db.models.AutoField'
# Email configuration (django.core.mail)
# https://django-environ.readthedocs.io/en/latest/#email-settings
EMAIL_CONFIG = env.email_url(
    'EMAIL_URL', default='smtp://user@:password@localhost:25'
)
#print(EMAIL_CONFIG)
vars().update(EMAIL_CONFIG)
DEFAULT_FROM_EMAIL              = env('DEFAULT_FROM_EMAIL')
DEFAULT_FROM_EMAIL_NO_REPLY     = env('DEFAULT_FROM_EMAIL_NO_REPLY')
EMAIL_APP_NAME                  = "Ellogon Annotation Platform" #name changed
EMAIL_USER_ACTIVATION_SUBJECT   = "{EMAIL_APP_NAME}: Account Activation for User: \"{user}\""
EMAIL_USER_ACTIVATION_BODY      = "This is an automatic email from {sender}. Please do not reply to this e-mail!"
EMAIL_USER_RESET_SUBJECT        = "{EMAIL_APP_NAME}: Account Password Reset for User: \"{user}\""
EMAIL_USER_RESET_BODY           = "This is an automatic email from {sender}. Please do not reply to this e-mail!"

#share project variables
EMAIL_USER_SHARE_COLLECTION_SUBJECT   = "{EMAIL_APP_NAME} wants to share a collection with you!"
EMAIL_USER_SHARE_COLLECTION_BODY      = "This is an automatic email from {sender}. Please do not reply to this e-mail!"


MONGO_DB_HOST=env("MONGO_DB_HOST")
MONGO_DB_PORT=int(env("MONGO_DB_PORT"))
MONGO_USERNAME=env("MONGO_USERNAME")
MONGO_PASSWORD=env("MONGO_PASSWORD")
MONGO_DATABASE=env("MONGO_DATABASE")
APP_LOGO="/static/assets/images/logo.jpg"
PASSWORD_HASHERS = [
    'clarin_backend.clarin_hasher.ClarinBCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
]
