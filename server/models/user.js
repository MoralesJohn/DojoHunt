var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({
	username: {type: String, required: true},
	score: {type: Number}
}, {timestamps: true});

mongoose.model('Player', PlayerSchema);
