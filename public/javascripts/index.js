var app = angular.module('myApp', ['ngSanitize'], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    '*://www.youtube.com/**',
    'localhost'
  ]);
});

app.factory('myFactory', function($http) {
  var api = {};
  var baseURL = "/"

  api.getMainStream = function() {
    var url = baseURL + "posts/main";
    return $http.get(url);
  }

  api.getUserInfo = function() {
    var url = baseURL + "users/me";
    return $http.get(url);
  }

  api.searchUsers = function(searchInput) {
    var url = baseURL + "users/search";
    return $http.get(url, {params: {searchText: searchInput}});
  }

  api.postNewPost = function(post) {
    var url = baseURL + "posts";
    return $http.post(url, post);
  }

  api.toggleSweet = function(postid) {
    var url = baseURL + "posts/sweet";
    return $http.put(url, {'postid': postid});
  }

  api.createNewReply = function(post, text) {
    var newReply = { textBody: post.newReply.text }
    var url = baseURL + "comments/" + post._id;
    return $http.post(url, newReply);
  }

  api.deletePost = function(post) {
    var url = baseURL + "posts/" + post._id;
    return $http.delete(url);
  }

  api.getCommentsForPost = function (post) {
    var url = baseURL + "comments/" + post._id;
    return $http.get(url);
  }



  return api;

});

app.controller('myCtrl', function($scope, myFactory) {

  //Data model for the stream
  $scope.stream = [];
  
  //Data model for the user data
  $scope.user = {};

  //searchable users
  $scope.usersSearchResults = [];

  //Data model for new post
  $scope.newPost = {};
  
  //Data model for posting new image
  $scope.newimg = {};
  
  //Data model for selected image for modal
  $scope.modalImg = {};
  
  //Holds the data for temporary settings
  $scope.tempData = {};


  var init = function() {

    $scope.refreshStream();

    myFactory.getUserInfo()
      .success(function (res) {
        $scope.user = res;
      })
      .error(function (res) {
        console.log("Error: getUserInfo()");
      });
  };

  $scope.refreshStream = function() {
    myFactory.getMainStream()
      .success(function (res) {
        $scope.stream = res;
      })
      .error(function (res) {
        console.log("Error: getMainStream()");
      });
  }
  
  
  
  /*************************
  start of angular functions
  *************************/
  
  //Create new post
  $scope.createNewPostOnEnter = function(event) {
    if (event.which == 13 || event.keyCode == 13) {
      $scope.createNewPost();
    }
  }

  $scope.createNewPost = function() {
    $('.upload-photo').hide();
      var postText = $scope.formatLinks($scope.newPost.text);
      var newPost = {
        id: $scope.stream.length,
        textBody: postText,
        user: $scope.user,
        timestamp: Date.now(),
        sweets: [],
        comments: []
      }
      
      if ($scope.newimg.src) { 
        newPost.imgURL = $scope.newimg.src;
      } 
      else {
        var imgURL = $scope.getImgURL($scope.newPost.text);
        var img = new Image();
        img.onload = function() {
          newPost.imgURL = imgURL;
        }
        img.src = imgURL;
      }
      
      var youtubeURL = $scope.getYoutubeURL($scope.newPost.text);
      newPost.youtubeURL = youtubeURL;
      
      myFactory.postNewPost(newPost)
        .success(function (res) {
          $scope.strean.refresh();
        })
        .error(function (res) {
          console.log("Error: Post new post failed " + res);
        });
      
      $scope.newPost.text = "";
      var ta = document.querySelector('textarea');
      autosize(ta);
      ta.value = "";
      // Dispatch a 'autosize:update' event to trigger a resize:
      var evt = document.createEvent('Event');
      evt.initEvent('autosize:update', true, false);
      ta.dispatchEvent(evt);
      $scope.newimg.src = "";
      $("#imginputpreview").attr('src', "");
      
      return false;
  }
  
  //format string with URL's
  $scope.formatLinks = function(string) {
    var stringArray = string.split(" ");
    var i;
    for ( i=0; i < stringArray.length; i++ ) {
      if (  stringArray[i].indexOf("http") == 0 
            || stringArray[i].indexOf("https") == 0
            || stringArray[i].indexOf("HTTP") == 0
            || stringArray[i].indexOf("HTTPS") == 0) {
        var newString = "<a href='" + stringArray[i] + "' target='_blank'>" + stringArray[i] + "</a>";
        stringArray[i] = newString;
      }
    }
    
    return stringArray.join(" ");
    
  }
  
  //Create new REPLY
  $scope.createNewReply = function(event, post) {
    if (event.which == 13 || event.keyCode == 13) {

      myFactory.createNewReply(post, post.newReply.text)
        .success(function (res) {
          post.comments = res;
          console.log(res);
        })
        .error(function (err) {
          console.log("Error: createNewReply() " + err);
        });
      
      var ta = $("#post" + post._id + " textarea");
      ta.val("");
      autosize.update(ta);
      
      return false;
    }
  }
  
  //Searches through post for img URL to post
  //**NEEDS DEBUG**
  $scope.getImgURL = function(string) {
    string = string.toLowerCase();
    
    var imgExtArray = ["jpg", "bmp", "jpeg", "gif", "png"];
    var beginLinkIndex = string.indexOf("http");
    var endLinkIndex = 0;
    
    for (i = 0; i < imgExtArray.length; i++) {
      var ext = imgExtArray[i];
      var extIndex = string.indexOf(ext);
      if (extIndex > 0) {
        endLinkIndex = extIndex + ext.length;
        break;
      }
    }
   
    
    if (beginLinkIndex < endLinkIndex) {
      return string.substring(beginLinkIndex, endLinkIndex);
    }
    
    return "";
  }
  
  //Searches through post of youtube URL
  $scope.getYoutubeURL = function(string) {
    //https://www.youtube.com/embed/IdneKLhsWOQ
    //https://www.youtube.com/watch?v=IdneKLhsWOQ
    if (string.indexOf("youtube.com") >= 0) {
      var stringArray = string.split("watch?v=");
      return "https://www.youtube.com/embed/" + stringArray[1];
    } else {
      return "";
    }
  }
  
  //Toggle upvote on post
  $scope.upvote = function(post) {
    var postid = post._id;
    myFactory.toggleSweet(postid)
      .success(function (res) {
        post.sweets = res;
      })
      .error(function (err) {
        console.log("Error: toggleSweet() " + err);
      });
  }
  
  /**
    Takes a post
    searches the sweets for the user
    if user exists it returns the index
    else return -1
  */
  $scope.indexOfSweet = function(post) {
    for (i=0; i < post.sweets.length; i++) {
      if (post.sweets[i]._id == $scope.user._id) return i;
    }
    return -1;
  }
  
  //Boolean function to check if post is upvoted
  $scope.isUpvoted = function(post) {
    for (i=0; i < post.sweets.length; i++) {
      if (post.sweets[i]._id == $scope.user._id) return true;
    }
    return false;
  }
  
  //Toggle the comments open for post
  $scope.openComments = function(post) {
    $scope.setAutoResize(post);
    $("#post" + post._id + " .comments").toggle('ease');
    $("#post" + post._id + " .comments").find('textarea').focus();
  }
  
  $scope.setAutoResize = function(post) {
    var ta = $("#post" + post._id + " textarea");
    ta.val("");
    autosize(ta);
  }
  
  $scope.openImgModal= function(post) {
    $scope.modalImg = post;
  }
  
  //Settings Functions
  $scope.setSettings = function() {
    $scope.user = angular.copy($scope.tempData);
  }
  $scope.cancelSettings = function() {
    $scope.tempData = angular.copy($scope.user);
  }
  
  //Canceling an Image Post
  $scope.cancelImgPost = function() {
    $('.upload-photo').hide();
    $scope.newimg.src = "";
    $("#imginputpreview").attr('src', "");
    $(".picture-btn").toggle('ease');
    $(".post-picture-btn").toggle('ease');
  }
  
  //delete a post
  $scope.deletePost = function(post) {
    myFactory.deletePost(post)
    .success(function (res) {
      $scope.refreshStream();
    })
    .error(function (err) {
      console.log("ERROR: deletePost() " + err);
    });

  }
  
  
  /**
    This activate the file input when the picture icon is clicked
  */
  
  //Engage the open file input
  //Engage the open file input
  $(".picture-btn").on('click', function() {
    $("#imginput").click();
  });

  $(".post-picture-btn").on('click', function() {
    $(".picture-btn").toggle();
    $(".post-picture-btn").toggle();
    $scope.createNewPost();
  });
  
  function readURL(input) {
      if (input.files && input.files[0]) {
          var reader = new FileReader();

          reader.onload = function (e) {
            $('.upload-photo').show();
            $scope.newimg.src = e.target.result;
            $("#imginputpreview").attr('src', e.target.result);
          }

          reader.readAsDataURL(input.files[0]);
      }
  }

  $("#imginput").change(function(){
    readURL(this);
    $('.post-textarea').focus();
    $(".picture-btn").toggle();
    $(".post-picture-btn").toggle();
  });
  
  //Upload new profile picture
  $scope.newProfileImg = function() { $("#profileImgInput").click(); }
  $("#profileImgInput").change(function() {
    var input = this;
    if (input.files && input.files[0]) {
          var reader = new FileReader();

          reader.onload = function (e) {
            $scope.user.imgURL = e.target.result;
            $("#profile-img").attr('src', e.target.result);
          }

          reader.readAsDataURL(input.files[0]);
      }
  });
  
  //initialize temp data for settings on open
  $scope.initTempData = function() {
    $scope.tempData = angular.copy($scope.user);
  }
  
  //Search for friends
  $scope.searchUsers = function() {
    $scope.usersSearchResults = [];
    
    var searchInput = $scope.friendSearchInput.text;

    myFactory.searchUsers(searchInput)
      .success(function (res) {
        $scope.usersSearchResults = res;
      })
      .error(function (err) {
        console.log("Error: searchUsers() " + err);
      });
  }
  
  $scope.userIsFriend = function(user) {
    var i;
    for ( i=0; i < $scope.pendingFriendRequests.length; i++ ) {
      if (user._id == $scope.pendingFriendRequests[i]._id) return true;
    }
    for ( i=0; i < $scope.user.friends.length; i++ ) {
      if (user._id == $scope.user.friends[i]._id) return true;
    }
    return false;
  }
  
  $scope.sendFriendRequest = function(friend) {
    $scope.pendingFriendRequests.push(friend);
    $scope.usersSearchResults = [];
    $scope.friendSearchInput = "";
  }
  
  $scope.approveFriendRequest = function(friend) {
    var indexOfFriend = $scope.pendingFriendRequests.indexOf(friend);
    $scope.pendingFriendRequests.splice(indexOfFriend, 1);
    $scope.user.friends.push(friend);
  }
  
  $scope.removeFriend = function(friend) {
    var i;
    for ( i=0; i < $scope.user.friends.length; i++ ) {
      if (friend._id == $scope.user.friends[i]._id) {
        $scope.user.friends.splice(i, 1);
      }
    }
  }

  init();
  
});


/**
BEGIN UX JAVASCRIPT GROUP

**/

/* Resize the text area for the post and reply when large amounts of text is entered.  This only initializes currently visable textareas
*/
autosize($('textarea'));

/*
The following javascript group takes a profile picture and places it in the profile div.  It looks to see if the image is wider or larger and adjusts the attribute to make it center in the profile img div
*/
/*$(document).ready(function() {
  var imgContainer = $("profile-pic");
  var img = getProfileImage("http://home.comcast.net/~patrick.swayze/pbfight.jpg");
  loadImg(imgContainer, img);
});*/

function getProfileImage(imgSrc) {
  var img = new Image();
  img.src = imgSrc;
  img.onload = function() {
    if (img.width <= img.height) img.style.width = '100%';
    else img.style.height = '100%';
  }
  return img;
}

function loadImg(imgContainer, img) {
  imgContainer.append(img);
}

/**
  Prevent a new line when enter is pressed
*/
$("textarea").keydown(function(e){
// Enter was pressed without shift key
if (e.keyCode == 13 && !e.shiftKey)
{
    // prevent default behavior
    e.preventDefault();
}
});

//$('.post-textarea').focus();
