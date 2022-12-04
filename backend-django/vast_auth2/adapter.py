from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from clarin_backend.models import Users

##
## Adapter from: https://stackoverflow.com/questions/28897220/django-allauth-social-account-connect-to-existing-account-on-login
##
class VASTAuth2SocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed
        (and before the pre_social_login signal is emitted).

        You can use this hook to intervene, e.g. abort the login by
        raising an ImmediateHttpResponse

        Why both an adapter hook and the signal? Intervening in
        e.g. the flow from within a signal handler is bad -- multiple
        handlers may be active and are executed in undetermined order.
        """
        # print("### VASTAuth2SocialAccountAdapter: pre_social_login()", flush=True)
        # social account already exists, so this is just a login
        if sociallogin.is_existing:
            return

        # some social logins don't have an email address
        if not sociallogin.email_addresses:
            return

        user = sociallogin.user
        if user.id:
            return

        if not user.email:
            return

        try:
            # if user exists, connect the account to the existing account and login
            existing_user = Users.objects.get(email=user.email)
            # print("Existing User:", existing_user, existing_user.id)
            sociallogin.connect(request, existing_user)
        except Users.DoesNotExist:
            pass
