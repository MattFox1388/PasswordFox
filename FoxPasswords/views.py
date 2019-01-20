from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect
from django.views.generic import View
from .forms import UserForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from .models import Accounts, Memos

import json
# Create your views here.


class UserFormView(View):
    user_form = UserForm
    template_name = 'registration.html'
    # show register form

    def get(self, request):
        form = self.user_form(None)
        return render(request, self.template_name, {'form': form})

    # process register form
    def post(self, request):
        form = self.user_form(request.POST)

        if form.is_valid():
            # locally store form data
            user = form.save(commit=False)
            # cleaned data
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user.set_password(password)
            user.save()

            # return User when valid
            user = authenticate(username=username, password=password)

            # checking db
            if user is not None:
                if user.is_active:
                    login(request, user) # user logged in
                    return HttpResponseRedirect('/')

        return render(request, self.template_name, {'form': form})


def logoutview(request):
    logout(request)
    return HttpResponseRedirect('/')


def main(request):
    return render(request, 'main.html', {})


@login_required
def memos(request):
    return render(request, 'memos.html', {})

class PasswordsView(View):

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def get(self, request):
        storedpass = Accounts.objects.filter(author=request.user).values()
        return render(request, 'passwords.html', {'stored': storedpass})

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def post(self, request):
        if json.loads(request.POST['getWebsite']):
            print("get Website")
            return self.get_website(request)
        elif json.loads(request.POST['deletePass']):
            # check if delete or edit memo
            print("delete")
            return self.delete_pass(request)
        elif json.loads(request.POST['editPass']):
            print("edit")
            return self.edit_pass(request)
        else:
            print("no Title")
            return self.no_website(request)

    def get_website(self, request):
        website = request.POST['website']
        context = Accounts.objects.filter(website=website).values()
        return JsonResponse({'context': list(context)})

    def no_website(self, request):
        # process and add account
        website = request.POST['website']
        email = request.POST['email']
        password = request.POST['password']
        substr = "www."
        if substr in website:
            website = website.replace("www.", "").replace("https://", "").replace("http://", "")
            icon = website[0:1]
        else:
            icon = website[0:1]
        Accounts.objects.create(website=website, icon=icon, email=email, password=password, author=request.user)
        # get all accounts updated
        accs = Accounts.objects.filter(author=request.user).values()
        return JsonResponse({'accounts': list(accs)})

    def delete_pass(self, request):
        website = request.POST['website']
        Accounts.objects.get(website=website).delete()
        return JsonResponse({})

    def edit_pass(self, request):
        website = request.POST['website']
        new_content = request.POST['changedPassword']
        obj = Accounts.objects.get(website=website)
        obj.password = new_content
        obj.save()
        return JsonResponse({})

class MemosView(View):

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def get(self, request):
        stored_memos = Memos.objects.filter(author=request.user).values()
        return render(request, 'memos.html', {'stored': stored_memos})

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def post(self, request):
        if json.loads(request.POST['getTitle']):
            print("get Title")
            return self.getTitle(request)
        elif json.loads(request.POST['deleteMemo']):
            # check if delete or edit memo
            print("delete")
            return self.deleteMemo(request)
        elif json.loads(request.POST['editMemo']):
            print("edit")
            return self.editMemo(request)
        else:
            print("no Title")
            return self.noTitle(request)

    def getTitle(self, request):
        title = request.POST['title']
        context = Memos.objects.filter(title=title).values()
        return JsonResponse({'context': list(context)})

    def noTitle(self, request):
        title = request.POST['title']
        content = request.POST['content']
        Memos.objects.create(title=title, content=content, author=request.user)
        # send all memos updated
        memos = Memos.objects.filter(author=request.user, title=title).values()
        return JsonResponse({'memos': list(memos)})

    def deleteMemo(self, request):
        title = request.POST['title']
        Memos.objects.get(title=title).delete()
        return JsonResponse({})

    def editMemo(self, request):
        title = request.POST['title']
        new_content = request.POST['changedContent']
        obj = Memos.objects.get(title=title)
        obj.content = new_content
        obj.save()
        return JsonResponse({})


class CreateView(View):

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def get(self, request):
        return render(request, 'create_pass.html', {})

    @method_decorator(login_required)
    @method_decorator(csrf_protect)
    def post(self, request):
        first = request.POST['wordOne']
        second = request.POST['wordTwo']
        age = abs(int(request.POST['age'])) * 2
        typeform = request.POST['type']
        newpass = first + second + str(age) + typeform[:2]
        return JsonResponse({'newPass': newpass})
