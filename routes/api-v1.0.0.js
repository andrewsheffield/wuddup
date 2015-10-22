var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');

router.get('/', function(req, res) {

	var data = {
		"API": "Example Authentication and resful API in Node",
		"Verison": "1.0.0"
	}
	res.send(data);
});

module.exports = router;