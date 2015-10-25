'use strict'

let chalk = require('chalk')

// loadController
let loadController = function(controllerPath) {
	// Delete existing controller from cache
	delete require.cache[controllerPath]

	// Load the js file
	try {
		return Promise.resolve(require(controllerPath))
	} catch(e) {
		if(e.code !== 'MODULE_NOT_FOUND')
			console.error(chalk.red(e))

		return Promise.resolve(null)
	}
}

module.exports = loadController