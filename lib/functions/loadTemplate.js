'use strict'

let jade = require('jade')
let chalk = require('chalk')
let Promise = require('bluebird')

// loadTemplate
let loadTemplate = function(templatePath) {
	try {
		return Promise.resolve(jade.compileFile(templatePath))
	} catch(e) {
		if(e.code !== 'ENOENT')
			console.error(chalk.red(e))

		return Promise.reject(e)
	}
}

module.exports = loadTemplate