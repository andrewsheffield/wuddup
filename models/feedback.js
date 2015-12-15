// bring in mongoose and grab the Schema constructor
var mongoose = require('mongoose');  
var Schema = mongoose.Schema;

//Post Schema
var feedbackSchema = new Schema({
	body: String,
	subject: String,
	creationTimestamp: {
		type: Date,
		default: Date.now
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});
var Feedback = mongoose.model('feedbacks', feedbackSchema);

// make the Item Schema available to other files
module.exports = Feedback; 

