// MODEL TO DESCRIBE, GET, AND SET A SINGLE USER
var queryUtil = require('../utils/queryUtil.js')
var bcrypt = require('bcrypt')

// constructor for our user using id
function user(id, email, facebook_id){
	this.id = id
	this.email = email;
	this.facebook_id = facebook_id;
	this.validUser = true
	if (isNaN(id)) {
		this.validUser = false
	}
}

//Check if the email of facebook id of a user exists
user.prototype.checkIfExists = function(res, callback)
{
	queryUtil.singleQuery(res,
		" SELECT email FROM users WHERE email = $1 OR facebook_id = $2",
		[this.email, this.facebook_id],
		function(result)
		{
			if (result.rowCount > 0) {
				callback(true)
			} else {
				callback(false)
			}
		})
}

//Has a password
user.prototype.hashPassword = function(password, callback)
{
	bcrypt.genSalt(10, function(err, salt) 
	{
	    bcrypt.hash(password, salt, function(err, hash) 
	    {
	    	callback(hash)
	    })
	})
}

//Hash an email, same as hash a password just named differently
user.prototype.hashEmail = function(email, callback)
{
	bcrypt.genSalt(10, function(err, salt) 
	{
	    bcrypt.hash(email, salt, function(err, hash) 
	    {
	    	callback(hash)
	    })
	})
}

user.prototype.insertUser = function(res, userObj, callback)
{
	var full_name = userObj.first + ' ' +  userObj.last
	var that = this
	this.hashPassword(userObj.password, function(hash)
	{
		queryUtil.singleQuery(res,
			'INSERT INTO users' +
		    '(email, password, first, last, full_name, sex, age, phone, ' +
		     ' img, facebook_id, facebook_link)' + 
		    'VALUES' +
		    '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)' + 
		    'RETURNING *', 
		    [userObj.email, hash, userObj.first, userObj.last,
		     full_name, userObj.sex, userObj.age, userObj.phone,
		     userObj.picture, userObj.facebook_id, userObj.facebook_link],
		     function(result)
		     {
		     	that.id = result.rows[0]._id
		     	callback(result.rows[0])
		     })
	})
}

// Get a users private information 
// - make sure to call the auth middleware is using this methode
user.prototype.getPrivate = function(res, callback)
{
	queryUtil.singleQuery(res,
	'SELECT age, car, email, facebook_id, phone, show_facebook, show_phone, des, first, last, img,' + 
	' preferences, sex, music, email_alerts, email_messages, email_feedback, email_verified ' + 
	'  FROM users WHERE _id = $1',
		[this.id], 
		function(result){
			callback(result.rows[0])
	})
}


// Get a users private information 
// - make sure to call the auth middleware is using this methode
user.prototype.getPrivateByFacebookId = function(res, callback)
{
	queryUtil.singleQuery(res,
	'SELECT age, car, email, facebook_id, phone, show_facebook, show_phone, des, first, last, img,' + 
	' preferences, sex, music, email_alerts, email_messages, email_feedback, email_verified ' + 
	'  FROM users WHERE facebook_id = $1',
		[this.facebook_id], 
		function(result){
			callback(result.rows[0])
	})
}

user.prototype.getLastTrips = function(res, callback)
{
	queryUtil.singleQuery(res,
		"SELECT trips._id, " + 
		" trips.drivers_limit, " + 
		" trips.gas, 'trip' AS type, " + 
		" trips.posted, trips.poster_id, trips.repeat, " + 
		" trips.round_trip, trips.seats, " + 
		" trips.start_date, trips.starting, trips.ending " + 
		" FROM "+
		" trips WHERE trips.poster_id = $1 AND trips.canceled != true " + 
		" ORDER BY trips.start_date DESC LIMIT 3",
		[this.id], 
		function(result){
			callback(result.rows)
	})
}

// Get a users public information, need to give response
user.prototype.getAllUserPublic = function(callback){
	if (!this.validUser) return null
	var user_id = this.id

	queryUtil.singleQueryWithError(
		'SELECT _id, age, car, des, email_verified, show_facebook, show_phone, ' + 
		' facebook_id, facebook_link, preferences, music, first, last, img, sex, phone ' +
		' FROM users WHERE _id = $1',
		[user_id],
		function(err, result){
			//If no user return null
			if (err || result.rowCount == 0) {
				callback(null)
				return
			}	

			var userData = result.rows[0]
			if (userData && !userData.show_facebook) {
				userData.facebook_link = 'private'
			}
			if (userData && !userData.show_phone) {
				userData.phone = 'private phone'
			}
			callback(userData)
		})
}

user.prototype.updateDetails = function(res, options, callback)
{
	if (this.id && options.first && options.last) {
		queryUtil.singleQuery(res,
			'UPDATE users SET first = $1, last = $2, ' + 
			' full_name = $3, age = $4,' + 
			' car = $5, sex = $6, des = $7, ' + 
			' position = $8 WHERE _id = $9',
			[options.first, options.last, options.fullName, 
			options.age, options.car, options.sex,
			 options.des, options.position, this.id], 
			function(result){
				callback(result)
		})
	} else {
		res.status(400).send({status:'You must enter a first, middle, and last name'})
		return
	}
}

user.prototype.updateContact = function(res, options, callback)
{
	queryUtil.singleQuery(res,
		'UPDATE users SET phone = $1 WHERE _id = $2',
		[options.phone, this.id], 
		function(result){
			callback(result.rows[0])
	})
}

user.prototype.updateContactPrivacy = function(res, options, callback)
{
	queryUtil.singleQuery(res,
		'UPDATE users SET show_phone = $1, show_facebook = $2 ' + 
		' WHERE _id = $3',
		[options.show_phone, options.show_facebook, this.id], 
		function(result){
			callback(result.rows[0])
	})
}
user.prototype.updateSettings = function(res, options, callback)
{
	queryUtil.singleQuery(res,
		'UPDATE users SET email_messages = $1,' + 
		' email_alerts = $2, email_feedback = $3 WHERE _id = $4',
		[options.newMessageAlerts, options.emailAlerts, options.feedbackAlerts, this.id],
		function(result){
			callback(result)
	})
}

user.prototype.updatePreferences = function(res, preferences, callback)
{
	queryUtil.singleQuery(res,
		'UPDATE users SET preferences = $1 WHERE _id = $2',
		[preferences, this.id],
		function(result){
			callback(result)
	})
}

user.prototype.updateMusic = function(res, music, callback)
{
	queryUtil.singleQuery(res,
		'UPDATE users SET music = $1 WHERE _id = $2',
		[music, this.id],
		function(result){
			callback(result)
	})
}

user.prototype.setEmailVerified = function(res, emailVerifiedBoolean, callback)
{
	queryUtil.singleQuery(res,
		"UPDATE users SET email_verified = true WHERE _id = $1",
		[emailVerifiedBoolean, this.id],
		function(result){
			callback(result)
	})
}



module.exports = user
