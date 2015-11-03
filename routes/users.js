var express = require('express');
var router = express.Router();

var User = require('../models/user.js');

//CREATE
router.post('/', function(req, res, next) {

	var newUser = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: "Test@wuddup.com",
		friends: [],
		status: "Bro",
		settings: {
	      receiveEmailsNotifications: true,
	      recieveEmailNews: true
	    }
	});

	newUser.save(function(err, data) {

		if (err) {
			res.json(err);
		}

		else {
			res.json(data);
		}

	});

});

//READ ALL
router.get('/', function(req, res, next) {

	User.find({})
	.populate('friends')
	.exec( function(err, data) {

		if (err) {
			res.json(err);
		}

		else if (data.length===0) {
			res.json({message: 'There are no items in the database.'});
		}

		else {
			res.json(data);
		}

	});

});

//READ ONE
router.get('/:id', function(req, res, next) {

	var id = {_id: req.params.id};

	User.findOne(id)
	.populate('friends')
	.exec(function(err, data) {

		if (err) {
			res.json(err);
		}

		else {
			res.json(data);
		}

	});

});

//UPDATE full object
router.put('/:id', function(req, res, next) {

	var id = {_id: req.params.id};
	var update = req.body;
	var options = {new: true};
	
	User.findOneAndUpdate(id, update, options, function(err, data) {

		if (err) {
			res.json(err);
		}

		else if (data.length===0) {
			res.json({message: "Item with that ID could not be found"});
		}

		else {
			res.json(data);
		}

	});

});

//ADD FRIEND
router.put('/:id1/addfriend/', function(req, res, next) {

	var userID = {_id: req.params.id1};
	var friend = {_id: req.body.friend};
	var update = {$push: {friends: friend}};
	var options = {new: true};

	User.findOneAndUpdate(userID, update, options, function(err, data) {

		if (err) {
			res.json(err);
		}

		else if (data.length===0) {
			res.json({message: "Item with that ID could not be found"});
		}

		else {
			res.json(data);
		}

	});

});

//REMOVE a friend
router.put('/:id1/removefriend/', function(req, res, next) {

	var userID = {_id: req.params.id1};
	var friend = {_id: req.body.friend};
	var update = {$pull: {friends: friend }};
	var options = {new: true};

	User.findOneAndUpdate(userID, update, options, function(err, data) {

		if (err) {
			res.json(err);
		}

		else if (data.length===0) {
			res.json({message: "Item with that ID could not be found"});
		}

		else {
			res.json(data);
		}

	});

});

//DELETE
router.delete('/:id', function(req, res, next) {

	var id = {_id:req.params.id};

	User.findOneAndRemove(id, function(err, data) {

		if (err) {
			res.json(err);
		}

		else {
			res.json({message: "Item was successfully deleted."});
		}

	});

});


module.exports = router;
