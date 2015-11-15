'use strict'

let fs = require('fs')
let chalk = require('chalk')
let Promise = require('bluebird')

// Promisify
Promise.promisifyAll(fs)

// getFile
let getFile = function(filePath, defaultData, encoding, writeDefaultFile) {
	encoding = (encoding !== undefined) ? encoding : 'utf8'
	writeDefaultFile = (writeDefaultFile !== undefined) ? writeDefaultFile : true

	if(typeof defaultData === 'object')
		defaultData = JSON.stringify(defaultData, null, '\t')

	return fs.statAsync(filePath).then(function(stats) {
		// Directories
		if(!stats.isFile())
			return Promise.resolve(defaultData)

		// Normal read
		return fs.readFileAsync(filePath, encoding)
	}).error(function() {
		// If it doesn't exist we'll create it with the default data.
		if(writeDefaultFile)
			fs.writeFileAsync(filePath, defaultData, encoding).catch(e => console.error(chalk.red(e)))

		return Promise.resolve(defaultData)
	})
}

module.exports = getFile