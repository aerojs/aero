'use strict'

let fs = require('fs')
let chalk = require('chalk')
let Promise = require('bluebird')

// Promisify
Promise.promisifyAll(fs)

// loadPageJSON
let loadPageJSON = function(jsonPath) {
	return fs.readFileAsync(jsonPath, 'utf8')
		.then(function(fileContents) {
			try {
				return JSON.parse(fileContents)
			} catch(e) {
				let aero = require('../')
				let path = require('path')

				if(aero.verbose)
					console.error(chalk.bold(chalk.red(path.relative(aero.config.path.pages, jsonPath) + ':')), chalk.red(e))

				return Promise.resolve(null)
			}
		})
		.error(function(readError) {
			if(readError.code !== 'ENOENT')
				console.error(chalk.red(readError))

			return Promise.resolve(null)
		})
}

module.exports = loadPageJSON