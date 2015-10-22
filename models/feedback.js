var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbackSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'users'
	},
	subject: String,
	creationDate: { type: Date, default: Date.now()},
	body: String
});

mongoose.model('feedback', feedbackSchema);
