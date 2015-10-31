'use strict'

let chalk = require('chalk')
let request = require('request')
let Promise = require('bluebird')

// Promisify
Promise.promisifyAll(request)

// download
let download = function(url, defaultData) {
	return request.getAsync(url).then(function(response) {
		if(response.statusCode === 404) {
			console.error(chalk.red(`Doesn't exist: ${url}`))

			// If it doesn't exist we'll return the default data.
			return Promise.resolve(defaultData)
		}

		// If everything went smoothly we'll return the contents
		return Promise.resolve(response.body)
	}).error(function() {
		console.error(chalk.red(`Error downloading ${url}`))

		// If there was an error we'll return the default data.
		return Promise.resolve(defaultData)
	})
}

module.exports = download