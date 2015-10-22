var app = angular.module('myApp', []).config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});

app.factory('myFactory', function($http) {
  var d = new Date(Date.now());
  
  var factory = {};

  factory.getDocument = function () {
    var windowURL = window.location.href
    var id = windowURL.substring(windowURL.lastIndexOf('/') + 1);
    var url = "/api-v1.0.0/documents/" + id;
    return $http.get(url);
  }
  
  factory.saveChanges = function (document) {
    var windowURL = window.location.href
    var id = windowURL.substring(windowURL.lastIndexOf('/') + 1);
    var url = "/api-v1.0.0/documents/" + id;
    return $http.put(url, document);
  }
  
  factory.sendFeedback = function(feedback) {
    var url = '/api-v1.0.0/feedback/';
    $http.post(url, feedback).success(function (res) {
      console.log(res);
    });
  }

  return factory;
});

app.controller('myCtrl', function($scope, myFactory) {

  $scope.document;
  
  init();
  
  function init() {
    myFactory.getDocument()
      .success(function (res) {
        $scope.document = res;
      })
      .error(function (err) {
        console.log(err);
      });
  }
  
  $scope.saveChanges = function() {
    myFactory.saveChanges($scope.document)
      .success(function (res) {
        console.log("Document hasbeen saved");
      })
      .error(function (err) {
        console.log("Error has occurred with save");
      });
  }
  
  $scope.sendFeedback = function () {
    var d = new Date(Date.now());
    var feedback = {
      subject: $scope.feedback.subject,
      body: $scope.feedback.body
    }
    myFactory.sendFeedback(feedback);
  }

});

$('#feedback-modal').on('hidden.bs.modal', function(){
  $(this).find('form')[0].reset();
});