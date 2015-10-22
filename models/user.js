var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
	name: {
		first: String,
		last: String
	},
	username: String,
	verified: { type: Boolean, default: false },
	creationDate: { type: Date, default: Date.now() },
	loginDates: [Date]
});

mongoose.model('users', usersSchema);
