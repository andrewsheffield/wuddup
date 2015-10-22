var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var bcrypt = require('bcrypt');

/*   /api-v1.0.0/authenticate/   */
router.post('/',
	passport.authenticate('local', 
	{
		failureRedirect: '/',
		failureFlash: true
	}),
	//Checks for remember me token...if no token exists it will invoke the next function
	//If rmtoken exists it will authenticate the ser and then invoke the next function
	function (req, res, next) {
		if (!req.body.rememberme) { return next(); }

    	mongoose.model('auth').findOne( { 'user' : req.user }, function (err, auth) {
    		auth.rmToken = crypto.randomBytes(16).toString('hex');
        	bcrypt.hash(auth.rmToken, 10, function(err, hash) {
          		res.cookie('remember_me', req.user.username + " " + hash, { maxAge: (30 * 24 * 60 * 60 * 1000), httpOnly: true });
          		auth.save();
          		return next();
        	});
    	});
	},
	//Function is invoked on successful authentication
	function (req, res) {
		console.log(req.user._id + " has logged in.");
		res.redirect('/dashboard');
	}
);

/*  /api-v1.0.0/logout/  */
router.get('/logout', function(req, res, next) {
	req.logout();
	res.clearCookie('remember_me');
	res.redirect('/');
});

module.exports = router;