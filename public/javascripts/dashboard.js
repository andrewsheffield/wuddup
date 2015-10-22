var app = angular.module('myApp', []).config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});

app.factory('myFactory', function($http) {
  var d = new Date(Date.now());
  var documents = [];
  
  var factory = {};
  factory.getDocuments = function () {
    var url = '/api-v1.0.0/documents/';
    $http.get(url).success(function (res) {
      res.forEach(function(obj, i) {
        documents.push(obj);
      });
    });
    return documents;
  }
  factory.pushDocument = function(document) {
    var url = '/api-v1.0.0/documents';
    $http.post(url, document).success(function (res) {
      documents.push(res);
    });
  }
  factory.updateDocument = function(document) {
    var url = '/api-v1.0.0/documents/' + document._id;
    $http.put(url, document).success(function (res) {
      documents.forEach(function(obj, i) {
        if (obj._id == res._id) {
          obj.title = res.title;
          obj.details = res.details;
        }
      });
    });
  }
  factory.deleteDocument= function(document) {
    for (var i in documents) {
      if (documents[i]._id == document._id) documents.splice(i, 1);
    }

    var url = '/api-v1.0.0/documents/' + document._id;
    $http.delete(url);
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

  
  
  $scope.documents = [];
  $scope.selected = {};
	$scope.docChanges = {};
  
  init();
  
  function init() {
    $scope.documents = myFactory.getDocuments();
  }
  
  $scope.addDoc = function() {
    var d = new Date(Date.now());
    var document =
      { 
        title: $scope.newDoc.title, 
        details: $scope.newDoc.details
    	};
    myFactory.pushDocument(document);
  }
  
  $scope.deleteDoc = function (doc) {
    if (confirm('Are you sure you want to delete this document?')) {
    	myFactory.deleteDocument(doc);
		}
  }
  
  $scope.openDoc = function (document) {
    alert("Opened document: " + document._id);
  }
  
  $scope.sendFeedback = function () {
    var d = new Date(Date.now());
    var feedback = {
      subject: $scope.feedback.subject,
      body: $scope.feedback.body
    }
    myFactory.sendFeedback(feedback);
  }
  
  $scope.detailsModal = function (document) {
    $scope.selected = document;
    $scope.docChanges = JSON.parse(JSON.stringify(document))
  }
  
  $scope.saveDocChanges = function () {
    myFactory.updateDocument($scope.docChanges);
  }
  
  $('.modal').on('shown.bs.modal', function() {
  	$scope.search = '';
	});

});

$(".content").on('click', function(event) {
  unselectDocuments();
  if ($(event.target).closest('.panel-doc').length) {
    selectDocument($(event.target).closest('.panel-doc'));
  }
});

function unselectDocuments() {
  $(".panel-doc").each(function() {
      $(this).removeClass('panel-info selected');
      $(this).addClass('panel-primary');
      $(this).find('.doc-details').show();
      $(this).find('.btn').hide();
      $(this).find('.delete-doc').hide();
    });
}

function selectDocument(document) {
  if (!document.hasClass('selected')) {
      document.removeClass('panel-primary');
      document.addClass('panel-info selected');
      document.find('.doc-details').hide();
      document.find('.btn').show();
      document.find('.delete-doc').show();
    }
}

$('#create-new-modal').on('hidden.bs.modal', function(){
  $(this).find('form')[0].reset();
});

$('#feedback-modal').on('hidden.bs.modal', function(){
  $(this).find('form')[0].reset();
});

$('#details-modal').on('hidden.bs.modal', function(){
  unselectDocuments();
});

$(".button").on('click', function () {
  $(this).toggleClass('sending').blur();
})