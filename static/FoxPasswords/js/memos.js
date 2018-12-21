var app = angular.module('memosApp', ['ngCookies', 'ngDialog']);

app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{$');
  $interpolateProvider.endSymbol('$}');
});

app.config(['$httpProvider', function($httpProvider){
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

let cookiesProvider_ref = null;
app.config( function($cookiesProvider) {
   cookiesProvider_ref = $cookiesProvider
});

app.controller('MemosCtrl', function($scope, $http, $cookies, $httpParamSerializerJQLike, ngDialog, $compile){
   $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
   $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrfmiddlewaretoken;

   function parseISO(str){
        let b = str.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
   }

  $scope.submit = function($event){
        $event.preventDefault();//no reload
        let input = $httpParamSerializerJQLike({ 'getTitle': '', 'title': $scope.Memo.title, 'content': $scope.Memo.content, 'csrfmiddlewaretoken': $cookies.csrfmiddlewaretoken});
        //post to django
        $http.post('', input)
            .then(function successCallback(response){
                console.log(response);
                $http.defaults.headers.post['X-CSRFToken'] = cookiesProvider_ref;
                //reset form
                $scope.Account = angular.copy({});
                //create html element
                let outDiv = document.createElement('div');
                outDiv.className = 'col-md-6';
                let cardDiv = document.createElement('div');
                cardDiv.className = 'card cardDiv';
                let cardBody = document.createElement('div');
                cardBody.className = 'card-body';
                let h5 = document.createElement('h5');
                h5.className = 'card-title';
                let strong = document.createElement('strong');
                strong.textContent = response.data.memos[0].title;
                let txt = document.createElement('p');
                txt.className = 'card-text';
                txt.textContent = 'Date Modified: '+ parseISO(response.data.memos[0].date_modified);
                let txtTwo = document.createElement('p');
                txtTwo.className = 'card-text';
                txtTwo.textContent = 'Date Created: '+ parseISO(response.data.memos[0].date_created);
                let btn = document.createElement('button');
                btn.className = 'btn btn-info';
                btn.textContent = 'See Content';
                let content = 'showContent($event)';
                console.log(content);
                btn.setAttribute('ng-click', content);
                //append all together
                outDiv.appendChild(cardDiv);
                cardDiv.appendChild(cardBody);
                cardBody.appendChild(h5);
                cardBody.appendChild(txt);
                cardBody.appendChild(txtTwo);
                cardBody.appendChild(btn);
                angular.element(cardBody).append($compile(btn)($scope));
                h5.appendChild(strong);
                //add another card with created element
                let count = document.querySelectorAll('.cardDiv').length;
                if(count % 2 == 0){//even -> start new row
                    let pageContent = document.querySelectorAll('.page-content');
                    let lastContent = pageContent[pageContent.length-1];
                    let pageDiv = document.createElement('div');
                    pageDiv.className = 'container row';
                    pageDiv.appendChild(outDiv);
                    lastContent.appendChild(pageDiv);
                }else{//odd -> end row
                    let rows = document.querySelectorAll('.row');
                    let lastRow = rows[rows.length-1];
                    lastRow.appendChild(outDiv);
                }
                newCard = angular.element();
            }, function errorCallback(response){
                console.log(response);
            });
    };
    // show user the content
    $scope.showContent = function($event){
        let elem = $event.target;
        let title = elem.parentNode.getElementsByTagName('strong')[0].textContent;
        let input = $httpParamSerializerJQLike({'getTitle': title ,'csrfmiddlewaretoken': $cookies.csrfmiddlewaretoken});
        //post to django
        $http.post('', input)
            .then(function successCallback(response){
                let content = response.data.context[0].content;
                ngDialog.open({
                    template: content,
                    plain: true
                });
            },function errorCallback(response){
                console.log(response);
            });
    };
});
