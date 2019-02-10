from django.db import models
from django.contrib.auth.models import User
from fernet_fields import EncryptedCharField
# Create your models here


class Accounts(models.Model):
    website = models.CharField(max_length=255)
    icon = models.CharField(max_length=1)
    email = models.CharField(max_length=255, default='example@aol.com')
    password = EncryptedCharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.CASCADE)


class Memos(models.Model):
    title = models.CharField(max_length=50)
    content = models.TextField()
    date_modified = models.DateTimeField(auto_now=True)
    date_created = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
