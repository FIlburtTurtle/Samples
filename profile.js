var express = require('express');
var router = express.Router();
var userModel = require('../models/user.js');
var Feedback = require('../models/feedback.js');
var Request = require('../models/request.js');
var queryUtil = require('../utils/queryUtil.js');
var async = require('async');


/*
 * GET city page.
 */

router.get( '/:user_id', function(req, res){

	var user_id = Number(req.params.user_id)
	var session = req.session;
	var user = new userModel(user_id);
	async.parallel([
		function(callback){
			user.getAllUserPublic(function(userData){
				callback(null, userData)
			})
		}, 
	function(callback){
			var feedback = new Feedback()
			feedback.getUserFeedback(res, user_id, function(feedbackData)
			{
				callback(null, feedbackData)
			})
		}, 
		function(callback){
			user.getLastTrips(res, function(lastTrips)
			{
				callback(null, lastTrips)
			})
		},
		function(callback){
			var request = new Request();
			request.getAllPublic(res, user_id, function(requests)
			{
				callback(null, requests)
			})
		}
	], function(err, results){
		if (results[0] === null) {res.redirect('/404'); return;}
		var packet = {	userData: results[0], 
						feedbackData : results[1], 
						tripsData : results[2], 
						requests : results[3], 
						session : session}
		res.json(packet);
	})
});

module.exports = router;
