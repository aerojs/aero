const fs = require('fs')
const tape = require('blue-tape')
const tapDiff = require('tap-diff')
const supertest = require('supertest-as-promised')
const assert = require('assert')

// Colorize
tape.createStream().pipe(tapDiff()).pipe(process.stdout)

// Aero app creation with output disabled
let newApp = require('../lib')
global.aero = root => {
	let app = newApp(root)
	app.verbose = false
	return app
}

// Network request tool
global.fetch = (app, route) => {
	return supertest(app.server.httpServer).get(route)
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

// Check app basics
tape.Test.prototype.appOk = function(app) {
	return this.doesNotThrow(() => {
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
	}, 'seems to be healthy')
}

// Run all tests
fs.readdir('test/tests', (error, files) => {
	files.forEach(file => require('./tests/' + file))
})