require('strict-mode')(function() {
	// Globals
	global.Promise = require('bluebird')
	global.chalk = require('chalk')

	var App = require('./App')

	// We export a function that generates a new app
	module.exports = root => {
		return new App(root)
	}
})