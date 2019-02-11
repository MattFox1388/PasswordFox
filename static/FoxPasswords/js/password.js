var app = angular.module('passwordApp', ['ngCookies', 'ngDialog']);

app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{$');
  $interpolateProvider.endSymbol('$}');
});

app.config(['$httpProvider', function($httpProvider){
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

var cookiesProvider_ref = null;
app.config( function($cookiesProvider) {
   cookiesProvider_ref = $cookiesProvider
});

app.controller('PassCtrl', function($scope, $http, $cookies, $httpParamSerializerJQLike, ngDialog, $compile, $window){
   $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
   $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrfmiddlewaretoken;

   $scope.passwordContent = {
       website:'',
       password:''
   };
   $scope.dialog = null;

    $scope.hidePass = function($event){
        let x = document.getElementById("formPass");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
    };
   //function called when form submit
    $scope.submit = function($event){
        $event.preventDefault();//no reload
        var input = $httpParamSerializerJQLike({'getWebsite':false, 'deletePass':false, 'editPass':false,
            'username':encodeURIComponent($scope.Account.username), 'website': encodeURIComponent($scope.Account.website),
            'email': encodeURIComponent($scope.Account.email), 'password': encodeURIComponent($scope.Account.password),
            'csrfmiddlewaretoken': $cookies.csrfmiddlewaretoken});
        //post to django
        $http.post('', input)
            .then(function successCallback(response){
                //figure out which account was created last
                console.log(response);
                var indexLastAcc = getIndexOfLatestId(response.data.accounts);
                $http.defaults.headers.post['X-CSRFToken'] = cookiesProvider_ref;
                //reset form
                $scope.Account = angular.copy({});
                //create html element
                var outDiv = document.createElement('div');
                outDiv.className = 'col-md-6';
                var cardDiv = document.createElement('div');
                cardDiv.className = 'card cardDiv';
                var cardBody = document.createElement('div');
                cardBody.className = 'card-body';
                //title of card
                var h5 = document.createElement('h5');
                h5.className = 'card-title';
                var strong = document.createElement('strong');
                strong.textContent = decodeURIComponent(response.data.accounts[indexLastAcc].website);
                //username text
                var h6 = document.createElement('h6');
                h6.className = 'card-text';
                h6.textContent = "Username: " + decodeURIComponent(response.data.accounts[indexLastAcc].username);
                //email text
                var txt = document.createElement('p');
                txt.className = 'card-text';
                txt.textContent = "Email: " + decodeURIComponent(response.data.accounts[indexLastAcc].email);
                var btn = document.createElement('button');
                btn.className = 'btn btn-info';
                btn.textContent = 'See Password';
                pass = 'showPass($event)';
                //creating card btns
                btn.setAttribute('ng-click', pass);
                let editBtn = document.createElement('button');
                editBtn.className = 'btn btn-primary';
                editBtn.textContent = 'Edit';
                let editContent = 'editPass($event)';
                editBtn.setAttribute('ng-click', editContent);
                let deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-danger';
                deleteBtn.textContent = 'Delete';
                let deleteContent = 'deletePass($event)';
                deleteBtn.setAttribute('ng-click', deleteContent);
                //append all together
                outDiv.appendChild(cardDiv);
                cardDiv.appendChild(cardBody);
                cardBody.appendChild(h5);
                cardBody.appendChild(h6);
                cardBody.appendChild(txt);
                cardBody.appendChild(btn);
                angular.element(cardBody).append($compile(btn)($scope));
                angular.element(cardBody).append($compile(editBtn)($scope));
                angular.element(cardBody).append($compile(deleteBtn)($scope));
                h5.appendChild(strong);
                //add another card with created element
                var count = document.querySelectorAll('.cardDiv').length;
                if(count % 2 == 0){//even -> start new row
                    var pageContent = document.querySelectorAll('.page-content');
                    var lastContent = pageContent[pageContent.length-1];
                    var pageDiv = document.createElement('div');
                    pageDiv.className = 'container row';
                    pageDiv.appendChild(outDiv);
                    lastContent.appendChild(pageDiv);
                }else{//odd -> end row
                    var rows = document.querySelectorAll('.row');
                    var lastRow = rows[rows.length-1];
                    lastRow.appendChild(outDiv);
                }
                newCard = angular.element();
            }, function errorCallback(response){
                console.log(response);
            });
    };
    // show user the password
    $scope.showPass = function($event){
        let elem = $event.target;
        let website = elem.parentNode.getElementsByTagName('strong')[0].textContent;
        console.log("website:" + website);
        let input = $httpParamSerializerJQLike({'getWebsite':true, 'deletePass':false, 'editPass':false,
            'website':encodeURIComponent(website),'csrfmiddlewaretoken': $cookies.csrfmiddlewaretoken});
        // post to django
        $http.post('', input)
            .then(function successCallback(response){
                let password = decodeURIComponent(response.data.context[0].password);
                ngDialog.openConfirm({
                    template: password,
                    plain: true
                });
            },function errorCallback(response){
                console.log(response);
            });
    };
    //edit memo
    $scope.editPass = function($event){
        let elem = $event.target;
        let website = elem.parentNode.getElementsByTagName('strong')[0].textContent;
        let input = $httpParamSerializerJQLike({'getWebsite':true, 'deletePass':false, 'editPass':false,
            'website': encodeURIComponent(website), 'csrfmiddlewaretoken': $cookies.csrfmiddlewaretoken});
        //get the password
        $http.post('', input)
            .then(function successCallback(response){
                let password = decodeURIComponent(response.data.context[0].password);
                $scope.passwordContent.password = password;
                $scope.passwordContent.website = website;
                let template = '<input type="password" ng-model="passwordContent.password"/>' +
                    '<br><button class="btn btn-primary" ng-click="changeContent()">submit</button>';
                ngDialog.openConfirm({
                    template: template,
                    plain: true,
                    scope: $scope
                },function errorCallback(response){
                    console.log(response);
                });
            });
    };
    //change password content
    $scope.changeContent = function(){
        let input = $httpParamSerializerJQLike({'getWebsite':false, 'deletePass':false, 'editPass':true,
            'website':encodeURIComponent($scope.passwordContent.website),
            'changedPassword':encodeURIComponent($scope.passwordContent.password),
            'csrfmiddlewaretoken': $cookies.csrfmiddlewaretoken});
        $http.post('', input)
            .then(function successCallback(response){
                console.log("Editing Successful");
                $scope.dialog.close();
            });
    };
    //delete password
    $scope.deletePass = function($event){
        let elem = $event.target;
        let website = elem.parentNode.getElementsByTagName('strong')[0].textContent;
        let input = $httpParamSerializerJQLike({'getWebsite':false, 'deletePass':true, 'editMemo':false,
            'website':encodeURIComponent(website), 'csrfmiddlewaretoken': $cookies.csrfmiddlewaretoken});
        $http.post('', input)
            .then(function successCallback(response){
                console.log("Deletion Successful");
                $window.location.reload();
            });
    };

    function getIndexOfLatestId(accounts){
        lastIdx = 0;
        maxIDnum = 0;
        for(let i = 0; i < accounts.length; i++){
            if(accounts[i].id > maxIDnum){
                maxIDnum = accounts[i].id;
                lastIdx = i;
            }
        }
        return lastIdx;
    }
});
