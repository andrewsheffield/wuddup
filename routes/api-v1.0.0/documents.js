var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');

//Root is the name of the document '/documents'

//Can be called as middleware to protect certain routes
function ensureAuth(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.status(403).send('Error 403: You are not authenticated.');
	}
}

//#####Create a new Document#####
router.post('/', ensureAuth, function(req, res) {

	var Document = mongoose.model('documents');
	var document = new Document(req.body);

	document.user = req.user;
	document.save(function (err, document) {
		if (err) res.send(500).send(err);
		else res.send(document);
	});

});

//#####Gets All documents header information for user#####
router.get('/', ensureAuth, function(req, res) {

	var model = mongoose.model('documents');
	var query = { user: req.user };

	model.find(query, function(err, documents) {
		if (err) res.status(500).send(err);
		else res.send(documents);
	});

});

////#####Get a Document#####
router.get('/:id', ensureAuth, function(req, res) {

	var model = mongoose.model('documents');
	var id = req.params.id;
	var query = { user: req.user, _id: id };

	model.findOne(query, function(err, document) {
		if (err) res.status(500).send(err);
		else res.send(document);
	});

});

////#####Update a Document#####
router.put('/:id', ensureAuth, function(req, res) {

	var model = mongoose.model('documents');
	var id = req.params.id;
	var query = { user: req.user, _id: id };
	var update = req.body;
	
	model.findOneAndUpdate(query, update, function(err, document) {
		console.log(document);
		if (err) {
			res.status(500).send(err);
			console.log(err);
		}
		else res.send(document);
	});
});

////#####Delete a Document#####
router.delete('/:id', ensureAuth, function(req, res) {

	var model = mongoose.model('documents');
	var id = req.params.id;
	var query = { user: req.user, _id: id };

	model.findOneAndRemove(query, function(err) {
		if (err) res.status(500).send(err);
		else res.sendStatus(204);
	});
});



module.exports = router;