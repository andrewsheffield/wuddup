// bring in mongoose and grab the Schema constructor
var mongoose = require('mongoose');  
var Schema = mongoose.Schema;

//Post Schema
var postSchema = new Schema({
	textBody: String,
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	creationTimestamp: {
		type: Date,
		default: Date.now
	},
	imgURL: String,
	youtubeURL: String,
	sweets: [{
		type: Schema.Types.ObjectId,
		ref: 'user'
	}],
	comments: [{
		type: Schema.Types.ObjectId,
		ref: 'comment'
	}]
});
var Post = mongoose.model('posts', postSchema);

// make the Item Schema available to other files
module.exports = Post; 