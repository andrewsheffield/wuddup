var express = require('express');
var router = express.Router();

var Post = require('../models/post.js');
var User = require('../models/user.js');
var Comment = require('../models/comment.js');

//CREATE NEW POST
router.post('/', function(req, res, next) {

	var newPost = new Post({
		textBody: req.body.textBody,
		owner: "5673213cf78937500c67cd47",
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

	var id = {_id: "5673213cf78937500c67cd47"}; //get from authentication
	//var ownerSelect = "_id firstName lastName";

	User.findOne(id, function(err, user) {
		if (err) res.json(err);
		else {
			Post.find({$or: [{owner: {$in: user.friends}}, {owner: user}]})
			.sort({'creationTimestamp': -1})
			.limit(3)
			.populate('owner comments')
			.exec(function (err, posts) {
				if (err) res.json(err);
				else {

					var options = {
				    	path: 'comments.owner',
				    	select: 'firstName lastName',
				    	model: 'users'
				    };

					Comment.populate(posts, options, function(err, data) {
                        res.json(posts);
		            });    
				}
			});
		}

	});
});

//GET MORE DATA
router.get('/loadmore', function(req, res, next) {

	var limit = 3;
	var lastPostTime = "2015-11-10T20:55:11.022Z";
	var id = {_id: "5673213cf78937500c67cd47"}; //get from authentication

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

//Set/unset sweet for post
router.put('/sweet', function( req, res, next) {

	var userid = "5673213cf78937500c67cd47"; //get from authentication
	var postid = {_id: req.body.postid};

	Post.findOne(postid, function(err, post) {
		if (err) res.json(err);
		else {
			var sweetIndex = -1;

			for (var i = 0; i < post.sweets.length; i++) {
				if (post.sweets[i] == userid) sweetIndex = i;
			}


			if (sweetIndex < 0) post.sweets.push(userid);
			else post.sweets.splice(sweetIndex, 1);

			post.save();

			res.json(post.sweets);
		}
	});
});

//GET USERS PROFILE (posts only by the user)
router.get('/profile', function(req, res, next) {
	var owner = {owner: "5673213cf78937500c67cd47"}; //get from authentication

	Post.find(owner, function(err, data) {
		if (err) res.json(err);
		else res.json(data);
	});
});

//remove a post where the user is the owner
router.delete('/:POSTID', function(req, res, next) {
	var owner = {owner: "5673213cf78937500c67cd47"}; //get from authentication
	var postid = {_id: req.params.POSTID};
	var query = {$and: [
			postid,
			owner
		]};

	Post.findOne(query)
	.remove()
	.exec(function (err, data) {
		if (err) res.json(err);
		else res.json(data);
	});
});


module.exports = router;
