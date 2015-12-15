var express = require('express');
var router = express.Router();

var User = require('../models/user.js');

//CREATE A NEW USER
router.post('/', function(req, res, next) {

	var newUser = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: "Test@wuddup.com",
		status: "Pro",
	});

	newUser.save(function(err, data) {

		if (err) res.json(err);
		else res.json(data);

	});
});

//GETS LOGGED IN USER
router.get('/me', function (req, res, next){

	var id = {_id: "563bf884b00cae65433c4cd8"}; //get from authentication
	var select = "_id firstName lastName imgURL status settings friends friendRequests email location creationTimestamp notifications";
	var friendSelect = "_id firstName lastName imgURL";

	User.findOne(id, select)
	.populate('friends friendRequests', friendSelect)
	.exec(function(err, data) {

		if (err) res.json(err);
		else res.json(data);

	});
});

//GET ALL (FOR DEBUG ONLY)
router.get('/', function(req, res, next) {

	var limit = req.query.limit;

	User.find({}, "-settings -loginTimestamps")
	.populate('friends', 'firstName lastName _id')
	.limit(limit)
	.exec(function(err, data) {

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

//UPDATE limited to allowed items
router.put('/me', function(req, res, next) {

	var id = {_id: "563bf884b00cae65433c4cd8"}; //get from authentication
	var update = {};
	var options = {new: true};

	if (req.body.firstName) update.firstName = req.body.firstName;
	if (req.body.lastName) update.lastName = req.body.lastName;
	if (req.body.settings) update.settings = req.body.settings;
	
	User.findOneAndUpdate(id, update, options, function(err, data) {

		if (err) res.json(err);
		else res.json(data);

	});
});


//ADD FRIEND
router.put('/:id/addfriend/', function(req, res, next) {

	var userID = {_id: req.params.id};
	var friendID = {_id: req.body.friendID};
	var update = {$push: {friends: friendID}};
	var options = {new: true};

	User.findOneAndUpdate(userID, update, options, function(err, data) {

		if (err) res.json(err);
		else if (data.length===0) res.json({message: "Item with that ID could not be found"});
		else res.json(data);

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




module.exports = router;
