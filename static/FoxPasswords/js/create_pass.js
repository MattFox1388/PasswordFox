var app = angular.module('createApp', ['ngCookies']);

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

app.controller('CreateCtrl', function($scope, $http, $httpParamSerializerJQLike, $cookies){

    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
   $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrfmiddlewaretoken;

   $scope.password = 'Nothing Yet.';
   $scope.createPassword = function($event)
   {
       $event.preventDefault();//no reload
       let userInput = $httpParamSerializerJQLike({'wordOne': $scope.wordOne, 'wordTwo': $scope.wordTwo, 'type': $scope.type, 'age': $scope.age});
       $http.post('', userInput)
           .then(function successCallback(response){
               let pass = response.data['newPass'];
               $scope.password = pass;
           }, function errorCallback(response){
                console.log(response);
           });
   };

});
