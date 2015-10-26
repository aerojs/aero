'use strict'

let chalk = require('chalk')
let UglifyJS = require('uglify-js')

// loadScript
let loadScript = function(scriptPath, verbose) {
	if(verbose === undefined)
		verbose = true

	try {
		let code = UglifyJS.minify(scriptPath).code
		return Promise.resolve(code)
	} catch(e) {
		if(verbose)
			console.error(chalk.red(e))

		return Promise.resolve('')
	}
}

module.exports = loadScript