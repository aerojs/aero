require('strict-mode')(function () {
	'use strict'

	let fs = require('fs')
	let path = require('path')
	let tape = require('blue-tape')
	let tapDiff = require('tap-diff')
	let Promise = require('bluebird')
	let requester = Promise.promisifyAll(require('request'))
	global.aero = require('../lib')

	// Colorize
	tape.createStream().pipe(tapDiff()).pipe(process.stdout)

	// Instead of setting
	// `app.verbose = false`
	// we overwrite the console functions because
	// `app.verbose` produces flawed coverage results.
	console.log = () => {}
	console.warn = () => {}
	console.error = () => {}

	// Network request tool
	global.fetch = (app, route) => {
		return requester.getAsync(app.localURL(route)).then(response => response.body)
	}

	global.fetchPost = (app, route) => {
		return requester.postAsync(app.localURL(route)).then(response => response.body)
	}

	// Wrapper around tape which auto-converts generators to coroutines
	global.test = (name, func) => {
		if(func.constructor.name === 'GeneratorFunction')
			func = Promise.coroutine(func)

		return tape(name, func)
	}

	// rmdir
	global.rmdir = function(dirPath, removeSelf, excludeFiles) {
		removeSelf = removeSelf !== undefined ? removeSelf : true

		try {
			var files = fs.readdirSync(dirPath)
		} catch(e) {
			console.error(e)
			return
		}

		for(let file of files) {
			if(excludeFiles && excludeFiles.indexOf(file) !== -1)
				continue

			let filePath = dirPath + '/' + file

			if(fs.statSync(filePath).isFile())
				fs.unlinkSync(filePath)
			else
				rmdir(filePath)
		}

		if(removeSelf)
			fs.rmdirSync(dirPath)
	}

	// Run all tests
	let files = fs.readdirSync('test/tests')
	files.forEach(file => require(path.resolve(path.join('./test/tests', file))))
})