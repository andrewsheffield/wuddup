var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var bcrypt = require('bcrypt');

//Can be called as middleware to protect certain routes
function ensureAuth(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.status(403).send('Error 403: You do not have the correct credentials to access this page.');
	}
}

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.verified) {
			res.redirect('/dashboard');
		} else {
			res.render('index', { message: 'You have not yet verified your email.' });
		}
	} else {
		res.render('index', { message: req.flash('error') });
	}
});

/* GET dashboard if authenticated.  */
router.get('/dashboard', function(req, res, next) {
	if (req.isAuthenticated()) {
		res.render('dashboard', { user: req.user });
	} else {
		res.redirect('/');
	}
});

router.get('/document/:id', ensureAuth, function(req, res, next) {
	res.render('document');
});


module.exports = router;
