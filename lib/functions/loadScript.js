'use strict'

let fs = require('fs')
let path = require('path')
let chalk = require('chalk')
let Promise = require('bluebird')
let UglifyJS = require('uglify-js')

Promise.promisifyAll(fs)

// loadScript
let loadScript = function(scriptPath, verbose) {
	if(verbose === undefined)
		verbose = true

	try {
		if(path.basename(scriptPath).endsWith('.min.js')) {
			// Already minified
			return fs.readFileAsync(scriptPath, 'utf8')
		} else {
			// Minify
			return Promise.resolve(UglifyJS.minify(scriptPath).code)
		}
	} catch(e) {
		if(verbose)
			console.error(chalk.red(e))

		return Promise.resolve('')
	}
}

module.exports = loadScript