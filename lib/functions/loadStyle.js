'use strict'

let fs = require('fs')
let chalk = require('chalk')
let stylus = require('stylus')
let autoprefixer = require('autoprefixer-stylus');
let Promise = require('bluebird')

// Promisify
Promise.promisifyAll(fs)

// loadStyle
let loadStyle = function(stylePath) {
	return fs.readFileAsync(stylePath, 'utf8').then(function(styleCode) {
		let style = stylus(styleCode).use(autoprefixer())
		let compileStyle = Promise.promisify(style.set('compress', true).render, {context: style})

		return compileStyle().catch(console.error)
	}).error(function(readError) {
		if(readError.code !== 'ENOENT')
			console.error(chalk.red(readError))

		return Promise.resolve(null)
	})
}

module.exports = loadStyle