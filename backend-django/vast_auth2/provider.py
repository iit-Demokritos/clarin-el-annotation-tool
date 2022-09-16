# -*- coding: utf-8 -*-
from allauth.socialaccount.providers.base import ProviderAccount
from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider


class VASTAuth2Account(ProviderAccount):
    def get_avatar_url(self):
        return self.account.extra_data.get("picture")

    def to_str(self):
        dflt = super(VASTAuth2Account, self).to_str()
        return self.account.extra_data.get("name", dflt)


class VASTAuth2Provider(OAuth2Provider):
    id = "vastauth2"
    name = "VAST Authentication"
    account_class = VASTAuth2Account

    def get_default_scope(self):
        return ["profile", "email"]

    def extract_uid(self, data):
        return str(data["id"])

    def extract_common_fields(self, data):
        return dict(
            email      = data.get("email"),
            username   = data.get("email"),
            name       = data.get("name"),
            user_id    = data.get("sub"),
            first_name = data.get("given_name"),
            last_name  = data.get("family_name"),
            picture    = data.get("picture"),
        )


provider_classes = [VASTAuth2Provider]
