# -*- coding: utf-8 -*-
import requests

from allauth.socialaccount import app_settings
from .provider import VASTAuth2Provider
from allauth.socialaccount.providers.oauth2.views import (
    OAuth2Adapter,
    OAuth2CallbackView,
    OAuth2LoginView,
)


class VASTAuth2OAuth2Adapter(OAuth2Adapter):
    provider_id = VASTAuth2Provider.id
    supports_state = True

    settings = app_settings.PROVIDERS.get(provider_id, {})
    provider_base_url = settings.get("AUTH_URL")

    access_token_url = "{0}/oauth2/access_token".format(provider_base_url)
    authorize_url    = "{0}/oauth2/authorize".format(provider_base_url)
    profile_url      = "{0}/userinfo".format(provider_base_url)

    def complete_login(self, request, app, token, response):
        extra_data = requests.get(
            self.profile_url,
            headers={"Authorization": f"Bearer {token.token}"}
        ).json()
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

        return self.get_provider().sociallogin_from_response(request, extra_data)


oauth2_login = OAuth2LoginView.adapter_view(VASTAuth2OAuth2Adapter)
oauth2_callback = OAuth2CallbackView.adapter_view(VASTAuth2OAuth2Adapter)
