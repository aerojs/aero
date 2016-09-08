require('strict-mode')(function () {
	'use strict'

	let path = require('path')
	let assert = require('assert')
	let tape = require('blue-tape')
	let tapDiff = require('tap-diff')
	let Promise = require('bluebird')

	global.fs = require('fs')
	global.aero = require('../lib')
	global.requester = Promise.promisifyAll(require('request'))

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
		return requester.getAsync({
			url: app.localURL(route),
			rejectUnauthorized: false
		})
	}

	global.fetchPost = (app, route) => {
		return requester.postAsync({
			url: app.localURL(route),
			rejectUnauthorized: false
		})
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

	global.appOk = function(t, app) {
		return t.doesNotThrow(() => {
			assert(app.config)
			assert(app.config.title)
			assert(app.config.ports)
			assert(app.config.ports.http)
			assert(app.config.ports.https)
			assert(app.config.ports.liveReload)

			assert(app.package)
			assert(app.package.name)
			assert(app.package.version)
			assert(app.package.description)
			assert(app.package.dependencies)

			assert(app.manifest)
			assert(app.manifest.name)

			assert(app.server.ready)
			assert(app.server.ready.then)

			assert(app.averageResponseTime >= 0)
			assert(app.averageResponseSize >= 0)
			assert(app.stylesSize >= 0)
			assert(app.scriptsSize >= 0)
		}, 'app is healthy')
	}

	// Run all tests
	let files = fs.readdirSync('test/tests')
	files.forEach(file => require(path.resolve(path.join('./test/tests', file))))
})