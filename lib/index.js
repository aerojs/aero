require('strict-mode')(function() {
	// ----------------------------------------
	// Global variables are usually a bad idea.
	// ----------------------------------------
	// However Aero is meant to be a high performance library and we're
	// not accepting the slow default implementation in V8.
	// bluebird currently has the fastest Promise implementation and
	// if that fact should ever change we can simply remove this line.
	global.Promise = require('bluebird')

	// Aero uses "apps" which are basically just web server instances
	// connected to a root directory on your drive.
	let App = require('./App')

	// Export a function that generates a new app.
	module.exports = root => {
		return new App(root)
	}
})