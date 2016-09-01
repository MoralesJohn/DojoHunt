var mongoose = require('mongoose');
var Player = mongoose.model('Player');

module.exports = (function() {
	return {

		//add an answer
		create: function(req, res) {
			//get question associated with new answer
			// Question.findOne({_id: req.params.id}, function(err, question) {
			// 	if (err) {
			// 		console.log(err);
			// 	} else {
			// 		var answer = new Answer(req.body);
			// 		answer.question = question._id //set reference
			// 		answer.likes = 0; //set initial to 0 likes
			// 		answer.save(function(err) {
			// 			if (err) {
			// 				res.json(err);
			// 			} else {
			// 				//no errors with answer save? save question!
			// 				question.answers.push(answer);
			// 				question.save(function(err) {
			// 					if (err) {
			// 						res.json(err);
			// 					} else {
			// 						res.json({'status': 'saved'});
			// 					}
			// 				});
			// 			}
			// 		});
			// 	}
			// });
		},

	}
})();
