var express = require('express');
var router = express.Router();

var Post = require('../models/post.js');
var User = require('../models/user.js');
var Comment = require('../models/comment.js');

//CREATE NEW POST
router.post('/', function(req, res, next) {

	var newPost = new Post({
		textBody: req.body.textBody,
		owner: "563bf884b00cae65433c4cd8",
		sweets: [],
		comments: []
	});

	newPost.save(function(err, data) {

		if (err) res.json(err);
		else res.json(data);

	})

});

//GET ALL POSTS (debug only)
router.get('/', function(req, res, next) {

	Post.find({}, function(err, data) {
		if (err) res.json(err);
		else res.json(data);
	});

});

//GET FOR MAIN STREAM (gets the users and friends posts and displays the most recent 10)
router.get('/main', function(req, res, next) {

	var id = {_id: "563bf884b00cae65433c4cd8"}; //get from authentication

	User.findOne(id, function(err, user) {
		if (err) res.json(err);
		else {
			Post.find({$or: [{owner: {$in: user.friends}}, {owner: user}]})
			.sort({'creationTimestamp': -1})
			.limit(3)
			.exec(function(err, posts) {
				if (err) res.json(err);
				else res.json(posts);
			});
		}

	});
});

//GET MORE DATA
router.get('/loadmore', function(req, res, next) {

	var limit = 3;
	var lastPostTime = "2015-11-10T20:55:11.022Z";
	var id = {_id: "563bf884b00cae65433c4cd8"}; //get from authentication

	User.findOne(id, function(err, user) {
		if (err) res.json(err);
		else {
			Post.find({$and: [
				{creationTimestamp: {$lt: lastPostTime}},
				{$or: [{owner: {$in: user.friends}}, {owner: user}]}
			]})
			.sort({'creationTimestamp': -1})
			.limit(limit)
			.exec(function(err, posts) {
				if (err) res.json(err);
				else res.json(posts);
			});
		}

	});


});

//GET USERS PROFILE (posts only by the user)
router.get('/profile', function(req, res, next) {
	var owner = {owner: "563bf884b00cae65433c4cd8"}; //get from authentication

	Post.find(owner, function(err, data) {
		if (err) res.json(err);
		else res.json(data);
	});
});


module.exports = router;
