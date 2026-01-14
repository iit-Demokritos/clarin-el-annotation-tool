from django.core.management.base import BaseCommand
from django.conf import settings
from clarin_backend.send_email import EmailAlert

class Command(BaseCommand):
    """Django command to check authentication e-mail delivery"""

    def handle(self, *args, **kwargs):
        username = 'test-email-username'
        content = {'user': username,
                   'link': 'https://activation.link.org',
                   'password': 'test-new-password',
        }
        for admin in settings.ADMINS:
            print(f'Delivering mails to: {admin}')
            alert = EmailAlert(admin[1], username, content)
            alert.send_activation_email()
            alert.send_resetpassword_email()
            alert.send_sharecollection_email()
