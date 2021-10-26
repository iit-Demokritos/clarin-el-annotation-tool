import os
from pathlib import Path
from email.mime.image import MIMEImage
from django.template import Context
from django.template.loader import render_to_string, get_template
from django.core.mail import EmailMessage, EmailMultiAlternatives, send_mail

from django.utils.encoding import force_bytes, force_text, DjangoUnicodeDecodeError
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.conf import settings


class EmailAlert():
    sender = settings.DEFAULT_FROM_EMAIL_NO_REPLY

    def __init__(self, recipient, username, content):
        self.username  = username
        self.recipient = [recipient]
        self.content   = content
        self.content.update({ "EMAIL_APP_NAME": settings.EMAIL_APP_NAME, "sender": self.sender })


    def send_email(self, template, subject, text, content):
        html = get_template(template).render(content)
        msg = EmailMultiAlternatives(subject=subject, body=text,
                                     from_email=self.sender, to=self.recipient)
        if html:
            msg.attach_alternative(html, "text/html")
            #msg.content_subtype = 'html'  
            #msg.mixed_subtype = 'related' 
            #with open(EmailAlert.image_path, mode='rb') as f:
            #            image = MIMEImage(f.read())
            #            msg.attach(image)
            #            image.add_header('Content-ID', f"<{self.image_name}>")
            try:
                  msg.send(fail_silently=False)
            except Exception as e:
               print("EX:")
               print(e)


    def send_activation_email(self):
        subject   = settings.EMAIL_USER_ACTIVATION_SUBJECT.format(**self.content)
        text      = settings.EMAIL_USER_ACTIVATION_BODY.format(**self.content)
        return self.send_email("user_activation.html", subject, text, self.content) #changed


    def send_resetpassword_email(self):
        subject   = settings.EMAIL_USER_RESET_SUBJECT.format(**self.content)
        text      = settings.EMAIL_USER_RESET_BODY.format(**self.content)
        return self.send_email("user_reset_password.html", subject, text, self.content)#changed

    # def send_shareproject_email(self):
    #      subject=settings.EMAIL_USER_SHARE_PROJECT_SUBJECT.format(**self.content)
    #      text = settings.EMAIL_USER_SHARE_PROJECT_BODY.format(**self.content)
    #      return self.send_email("frontend/user_share_project.html", subject, text, self.content)
    def send_sharecollection_email(self):
        subject = settings.EMAIL_USER_SHARE_COLLECTION_SUBJECT.format(**self.content)
        text = settings.EMAIL_USER_SHARE_COLLECTION_BODY.format(**self.content)
        return self.send_email("user_share_collection.html", subject, text, self.content)