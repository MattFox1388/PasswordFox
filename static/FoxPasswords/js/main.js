var app = angular.module('mainApp', ['ngRoute']);

app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{$');
  $interpolateProvider.endSymbol('$}');
});


app.controller('MainCtrl', function($scope){
   $scope.msg = 'Inside the main ctrl';
});


