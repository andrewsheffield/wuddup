// bring in mongoose and grab the Schema constructor
var mongoose = require('mongoose');  
var Schema = mongoose.Schema;

//Post Schema
var commentSchema = new Schema({
	textBody: String,
	creationTimestamp: {
		type: Date,
		default: Date.now
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});
var Comment = mongoose.model('comments', commentSchema);

// make the Item Schema available to other files
module.exports = Comment;

