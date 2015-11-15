'use strict'

// let fs = require('fs')
let chalk = require('chalk')

// loadController
let loadController = function(controllerPath) {
	// Delete existing controller from cache
	delete require.cache[controllerPath]

	// Load the js file
	try {
		// let stats = fs.statSync(controllerPath)
		// if(stats['size'] === 0) {
		// 	console.log(controllerPath)
		// 	fs.writeFileSync(controllerPath, 'module.exports = {\n\t\n}', 'utf8')
		// }

		return Promise.resolve(require(controllerPath))
	} catch(e) {
		if(e.code !== 'MODULE_NOT_FOUND' && e.code !== 'ENOENT')
			console.error(chalk.red(e))

		return Promise.resolve(null)
	}
}

module.exports = loadController