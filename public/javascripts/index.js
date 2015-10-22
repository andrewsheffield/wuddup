var app = angular.module("login", []);

app.factory('loginFactory', function($http) {
  var factory = {};
  
  factory.login = function(email, password) {
    var data = {
      "username": email,
      "password": password
    }
    var url = "http://localhost:3000/api-v1.0.0/authenticate/"
    $http.post(url, data).success(function (res) {
      console.log(res);
    });
  }
  
  return factory;
});

app.controller("loginCont", function($scope, loginFactory) {
  $scope.attemptLogin = function() {
    var email = $scope.loginEmail.string;
    var password = $scope.loginPassword.string;
    if (!email || !password) {
      alert("Email or password is not valid...Try again");
    } else {
      loginFactory.login(email, password);
    }
  }
});