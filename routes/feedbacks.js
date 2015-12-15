var express = require('express');
var router = express.Router();

var Feedback = require('../models/feedback.js');

//CREATE NEW FEEDBACK
router.post('/', function(req, res, next) {

	var newFeedback = new Feedback({
		body: req.body.body,
		subject: req.body.subject,
		creator: "5639189ef041c8f72efd53ca"
	});

	newFeedback.save(function(err, data) {

		if (err) res.json(err);
		else res.json(data);

	})

});

//GET ALL FEEDBACK (DEBUG ONLY)
router.get('/', function(req, res, next) {

	Feedback.find({}, function(err, data) {
		if (err) res.json(err);
		else res.json(data);
	});

})


module.exports = router;
