'use strict';

var Activity = require('../../models/activity.js')
var queryUtil = require('../../utils/queryUtil.js');
var testUtil = require('../../utils/testUtils.js');

var mock_request = {query : {}};
var mock_response = {query : {}};

describe("creating a activity via options", function(){
	it("should return an instance based on the given options", function(){
		var options = {	getTrips : true,
						getRequests : true}
		expect(new Activity(mock_request, options).options.getTrips).toBe(true)
		expect(new Activity(mock_request, options).options.getRequests).toBe(true)
	})
})

function checkActivityResult(activity_results){
	expect(activity_results.trips).toBeDefined()
	expect(activity_results.alerts).toBeDefined()
	expect(activity_results.start_point).toBeDefined()
	expect(activity_results.combined_array).toBeDefined()
}

describe("getting passing trip activity", function(){
	it("should get passing trips", function(done){
		var options = {	getTrips : true,
						geo : true,
						type : 'passing',
						getRequests : true}
		var passing_activity = new Activity(mock_request, options)
		passing_activity.findActivity(mock_response, mock_request, function(activity_results){
			checkActivityResult(activity_results)
			done()
		})
	})
})

describe("getting going trip activity", function(){
	it("should get trips going to a destination", function(done){
		var options = {	getTrips : true,
						geo : true,
						type : 'going',
						getRequests : true}
		var going_activity = new Activity(mock_request, options)
		going_activity.findActivity(mock_response, mock_request, function(activity_results){
			checkActivityResult(activity_results)
			done()
		})
	})
})

describe("getting matching trip activity", function(){
	it("should get matching start and end trips", function(done){
		var options = {	getTrips : true,
						geo : true,
						type : 'matching',
						getRequests : true}
		var matching_activity = new Activity(mock_response, mock_request, options)
		matching_activity.matchingActivity(mock_response, mock_request, function(activity_results){
			console.log(activity_results);
			checkActivityResult(activity_results)
			done()
		})
	})
})

describe("getting all trip activity", function(){
	it("should get all trips", function(done){
		var options = {	getTrips : true,
						geo : true,
						type : 'all',
						getRequests : true}
		var all_activity = new Activity(mock_request, options)
		all_activity.findActivity(mock_response, mock_request, function(activity_results){
			checkActivityResult(activity_results)
			done()
		})
	})
})

describe("getting recent trip activity", function(){
	it("should get recent trips", function(done){
		var options = {	getTrips : true,
						geo : true,
						type : 'recent',
						getRequests : true}
		var all_activity = new Activity(mock_request, options)
		all_activity.findActivity(mock_response, mock_request, function(activity_results){
			checkActivityResult(activity_results)
			expect(activity_results.combined_array.length).toBeLessThan(7)
			done()
		})
	})
})

describe("getting random trip activity", function(){
	it("should get random trips", function(done){
		var activity = new Activity(mock_request, {})
		activity.getRandTrips(mock_response, function(rand_trips)
		{
			console.log('\n' + rand_trips);
			expect(rand_trips).toBeDefined();
			expect(rand_trips.length).toBeGreaterThan(1)
			done()
		})
	})
})
