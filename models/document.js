var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var documentsSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'users'
	},
	title: { type: String, default: "New Document" },
	details: { type: String, default: "Details about your document." },
	status: { type: String, default: "New" },
	creationDate: { type: Date, default: Date.now() },
	modifiedDates: [Date],
	openedDates: [Date],
	body: String
});

mongoose.model('documents', documentsSchema);
