var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var authSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'users'
	},
	password: String,
	rmToken: { type: String, default: "" }
});

mongoose.model('auth', authSchema);
