var express = require('express');
var router = express.Router();

var Post = require('../models/post.js');
var User = require('../models/user.js');
var Comment = require('../models/comment.js');

//GET comments for POSTID
router.get('/:POSTID', function(req, res, next) {

	var postid = req.params.POSTID;
	var select = "comments";

	Post.findOne({_id: postid}, select)
	.populate('comments')
	.exec(function (err, post) {
		if (err) res.json(err);
		else {
			var options = {
		    	path: 'comments.owner',
		    	select: 'firstName lastName',
		    	model: 'users'
		    };

			Comment.populate(post, options, function(err, data) {
                res.json(post.comments);
            }); 
		}
	});
});

//CREATE a new reply to a post returns all the comments to the post
router.post('/:POSTID', function( req, res, next) {

	var userid = "5673213cf78937500c67cd47"; //get from authentication
	var postid = req.params.POSTID;

	var newComment = Comment({
		textBody: req.body.textBody,
		owner: userid
	});

	newComment.save();

	Post.findOne({_id: postid})
	.populate('comments')
	.exec(function(err, post) {
		if (err) res.json(err);
		else {
			post.comments.push(newComment);
			post.save();

			var options = {
		    	path: 'comments.owner',
		    	select: 'firstName lastName',
		    	model: 'users'
		    };

			Comment.populate(post, options, function(err, data) {
                res.json(post.comments);
            });
		}
	});
});

module.exports = router;
