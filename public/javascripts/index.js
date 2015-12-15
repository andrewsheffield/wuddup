var app = angular.module('myApp', ['ngSanitize']);
app.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    '*://www.youtube.com/**',
    'localhost'
  ]);
});
app.controller('myCtrl', function($scope) {

  //Data model for the stream
  $scope.stream = [];
  
  //Data model for the user data
  $scope.data = {
    user: {
      id: 1,
      firstName: "Patrick",
      lastName: "Swayze",
      imgURL: "images/abi.jpg"
    },
    friends: [],
    status: "Broseidon",
    settings: {
      receiveEmailsNotifications: true,
      recieveEmailNews: true
    }
  };
  
  //Data model for new post
  $scope.newPost = {};
  
  //Data model for posting new image
  $scope.newimg = {};
  
  //Data model for selected image for modal
  $scope.modalImg = {};
  
  //Holds the data for temporary settings
  $scope.tempData = {};
  
  //searchable users
  $scope.usersSearchResults = [];
  
  $scope.pendingFriendRequests = [];
  
  /*************************
  start of angular functions
  *************************/
  
  //Create new post
  $scope.createNewPost = function(event) {
    if (event.which == 13 || event.keyCode == 13) {
      $('.upload-photo').hide();
      var postText = $scope.formatLinks($scope.newPost.text);
      var newPost = {
        id: $scope.stream.length,
        textBody: postText,
        user: $scope.data.user,
        timestamp: Date.now(),
        sweet: [],
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
      
      $scope.stream.push(newPost);
      
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
      var newReply = {
        id: post.comments.length,
        textBody: post.newReply.text,
        user: $scope.data.user,
        timestamp: Date.now()
      }
      post.comments.push(newReply);
      
      var ta = $("#post" + post.id + " textarea");
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
    var index = $scope.indexOfSweet(post);
    if (index < 0) {
      post.sweet.push($scope.data.user);
    } else {
      post.sweet.splice(index, 1);
    }
  }
  
  /**
    Takes a post
    searches the sweets for the user
    if user exists it returns the index
    else return -1
  */
  $scope.indexOfSweet = function(post) {
    for (i=0; i < post.sweet.length; i++) {
      if (post.sweet[i].id == $scope.data.user.id) return i;
    }
    return -1;
  }
  
  //Boolean function to check if post is upvoted
  $scope.isUpvoted = function(post) {
    for (i=0; i < post.sweet.length; i++) {
      if (post.sweet[i].id == $scope.data.user.id) return true;
    }
    return false;
  }
  
  //Toggle the comments open for post
  $scope.openComments = function(post) {
    $scope.setAutoResize(post);
    $("#post" + post.id + " .comments").toggle('ease');
    $("#post" + post.id + " .comments").find('textarea').focus();
  }
  
  $scope.setAutoResize = function(post) {
    var ta = $("#post" + post.id + " textarea");
    ta.val("");
    autosize(ta);
  }
  
  $scope.openImgModal= function(post) {
    $scope.modalImg = post;
  }
  
  //Settings Functions
  $scope.setSettings = function() {
    $scope.data = angular.copy($scope.tempData);
  }
  $scope.cancelSettings = function() {
    $scope.tempData = angular.copy($scope.data);
  }
  
  //Canceling an Image Post
  $scope.cancelImgPost = function() {
    $('.upload-photo').hide();
    $scope.newimg.src = "";
    $("#imginputpreview").attr('src', "");
  }
  
  //delete a post
  $scope.deletePost = function(post) {
    for (i = 0; i < $scope.stream.length; i++) {
      if (post.id == $scope.stream[i].id) {
        $scope.stream.splice(i, 1);
      }
    }
  }
  
  
  /**
    This activate the file input when the picture icon is clicked
  */
  
  //Engage the open file input
  $(".picture-btn").on('click', function() {
    $("#imginput").click();
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
  });
  
  //Upload new profile picture
  $scope.newProfileImg = function() { $("#profileImgInput").click(); }
  $("#profileImgInput").change(function() {
    var input = this;
    if (input.files && input.files[0]) {
          var reader = new FileReader();

          reader.onload = function (e) {
            $scope.data.user.imgURL = e.target.result;
            $("#profile-img").attr('src', e.target.result);
          }

          reader.readAsDataURL(input.files[0]);
      }
  });
  
  //initialize temp data for settings on open
  $scope.initTempData = function() {
    $scope.tempData = angular.copy($scope.data);
  }
  
  //Search for friends
  $scope.searchUsers = function() {
    $scope.usersSearchResults = [];
    
    var inputText = $scope.friendSearchInput.text.toLowerCase();
    var inputTextArray = inputText.split(" ");
    var inputTextFirst = inputTextArray[0];
    var inputTextSecond = inputTextArray[1];
    
    var i;
    for ( i=0; i < worldUserList.length; i++) {
      var friend = worldUserList[i];
      var firstName = friend.firstName.toLowerCase();
      var lastName = friend.lastName.toLowerCase();
      var iOfFirst = firstName.indexOf(inputTextFirst);
      var iOfLast = lastName.indexOf(inputTextFirst);
      var iOfLastSecond = lastName.indexOf(inputTextSecond);
      var areFriends = $scope.userIsFriend(worldUserList[i]);
      if (  
        (iOfFirst == 0 && !inputTextSecond && !areFriends) //checks first name is no last is present
        || (iOfLast == 0 && !inputTextSecond && !areFriends) //checks last name against last name
        || (iOfFirst == 0 && iOfLastSecond == 0 && !areFriends) //checks first and last
      )
      {
        $scope.usersSearchResults.push(worldUserList[i]);
      }
    }
  }
  
  $scope.userIsFriend = function(user) {
    var i;
    for ( i=0; i < $scope.pendingFriendRequests.length; i++ ) {
      if (user.id == $scope.pendingFriendRequests[i].id) return true;
    }
    for ( i=0; i < $scope.data.friends.length; i++ ) {
      if (user.id == $scope.data.friends[i].id) return true;
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
    $scope.data.friends.push(friend);
  }
  
  $scope.removeFriend = function(friend) {
    var i;
    for ( i=0; i < $scope.data.friends.length; i++ ) {
      if (friend.id == $scope.data.friends[i].id) {
        $scope.data.friends.splice(i, 1);
      }
    }
  }
  
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


var worldUserList = [{
    id: 0,
    firstName: "Jessica",
    lastName: "Alba",
    friendsInCommon: 12,
    imgURL: ""
  }, {
    id: 1,
    firstName: "Jessica",
    lastName: "Biel",
    friendsInCommon: 4,
    imgURL: ""
  }, {
    id: 2,
    firstName: "Keanu",
    lastName: "Reeves",
    friendsInCommon: 7,
    imgURL: ""
  }, {
    id: 3,
    firstName: "Gary",
    lastName: "Busey",
    friendsInCommon: 2,
    imgURL: ""
  },
];