"""FinalProject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from FoxPasswords import views
from FoxPasswords.views import UserFormView, PasswordsView, MemosView, CreateView
from django.contrib.auth.views import LoginView

app_name = 'FoxPasswords'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.main, name='home'),
    path('passwords', PasswordsView.as_view()),
    path('memos', MemosView.as_view()),
    path('create_pass', views.CreateView.as_view()),
    path('register', UserFormView.as_view()),
    path('login', LoginView.as_view()),
    path('logout', views.logoutview)
]
