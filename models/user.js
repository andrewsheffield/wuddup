// bring in mongoose and grab the Schema constructor
var mongoose = require('mongoose');  
var Schema = mongoose.Schema;

//User schema
var userSchema = new Schema ({
	firstName: String,
	lastName: String,
	email: String,
	imgURL: String,
	hashedPassword: String,
	location: {
		type: Number,
		index: "2dsphere"
	},
	friends: [{
		type: Schema.Types.ObjectId, 
		ref: 'users'
	}],
	friendRequests: [{
		type: Schema.Types.ObjectId,
		ref: 'users'
	}],
	status: String,
	creationTimestamp: {
		type: Date,
		default: Date.now
	},
	activated: Boolean,
	loginTimestamps: [Date],
	settings: {
      receiveEmailsNotifications: {
      	type: Boolean,
      	default: true
      },
      recieveEmailNews: {
      	type: Boolean,
      	default: true
      }
    },
    notifications: [{
    	type: Schema.Types.ObjectId,
    	ref: 'post'
    }]
});
var User = mongoose.model('users', userSchema);



// make the Item Schema available to other files
module.exports = User; 