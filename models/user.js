// bring in mongoose and grab the Schema constructor
var mongoose = require('mongoose');  
var Schema = mongoose.Schema;

//User schema
var userSchema = new Schema ({
	firstName: String,
	lastName: String,
	email: String,
	friends: [{type: Schema.Types.ObjectId, ref: 'users'}],
	status: String,
	settings: {
      receiveEmailsNotifications: Boolean,
      recieveEmailNews: Boolean
    }
});
var User = mongoose.model('users', userSchema);

//Post Schema
var postSchema = new Schema({
	textBody: String,
	owner: Schema.Types.ObjectId,
	creationTimestamp: Date,
	imgURL: String,
	youtubeURL: String,
	sweets: [Schema.Types.ObjectId],
	comments: [{
		textBody: String,
		owner: Schema.Types.ObjectId,
		creationTimestamp: Date
	}]
});
var Post = mongoose.model('posts', postSchema);



// set up the connection to the local database, if it doesn't exist yet one will be created automatically
mongoose.connect('mongodb://localhost/mongo-item');

// make the Item Schema available to other files
module.exports = User; 