var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "sheffieldusmc@gmail.com",
        pass: "dqbtbcrzzkmbarys"
    }
});

router.post('/', function(req, res) {

	//Function to be used on Strings to set proper capitalization
	String.prototype.capitalize = function() {
    	return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
	}


	var firstname = req.body.firstname.capitalize();
	var lastname = req.body.lastname.capitalize();
	var username = req.body.username.toLowerCase();
	var password = req.body.password;

	if (	firstname == ''
		||	lastname == ''
		||	username == ''
		||	password == '') 
	{
		res.render('infosplash', {
			title: 'Ink-Slinger - Oops',
			header: 'Something went wrong.',
			body: 'It looks like you may have missed a few fields when signing up. Please go back and try again.'
		})
	} else {

		

		var salt = bcrypt.genSaltSync();

		var User = mongoose.model('users');
		var user = new User;

		user.name.first = firstname;
		user.name.last = lastname;
		user.username = username;
		user.creationDate = Date.now();


		user.save(function(err, user) {
			if (err) return console.error(err);
			else { 

				var Auth = mongoose.model('auth');
				var auth = new Auth;

				auth.user = user.id;
				auth.password = bcrypt.hashSync(password, salt);

				auth.save(function(err, auth) {
					if (err) return console.error(err);

					console.log('User ' + user._id + ' has just signed up.');
					var url = req.protocol + '://' + req.get('host') + "/api-v1.0.0/signup/verify/" + user._id;

					// setup e-mail data with unicode symbols
					var mailOptions = {
					    from: "Ink-Slinger <noreply@ink-slinger.com>", // sender address
					    to: username, // list of receivers
					    subject: "Confirm Email", // Subject line
					    text: "Enable HTML emails", // plaintext body
					    html: "<a href='" + url + "'>" + url + "</a>" // html body
					}

					// send mail with defined transport object
					smtpTransport.sendMail(mailOptions, function(error, res){
					    if(error){
					        console.log(error);
					    }else{
					        console.log("EMAIL Confirmation message sent");
					    }

					});

					res.render('infosplash', {
						title: 'Ink-Slinger - Check your email',
						header: 'Thank you for signing up!',
						body: "Please check your email for your confirmation link to finish the signup process. If you haven't received an email within a few minutes, check your spam box."
					});
				});

			};
		});

	}

});

router.get('/verify/:id', function(req, res) {
	var message = "";
	mongoose.model('users').findOne({ '_id': req.params.id }, function(err, user) {
		if (user) {
			user.verified = true;
			user.save();
			res.render('infosplash', {
				title: "Ink-Slinger - Verified",
				header: "Your account has been verified.",
				body: "Please go back and login to begin writing. We hoping you enjoy."
			});
		}
	});

	
	
});

module.exports = router;