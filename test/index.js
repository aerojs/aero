let fs = require('fs')
let tape = require('blue-tape')
let tapDiff = require('tap-diff')
let supertest = require('supertest-as-promised')

// Colorize
tape.createStream().pipe(tapDiff()).pipe(process.stdout)

// Global variables in tests
global.aero = require('../lib')
global.Promise = require('bluebird')
global.fetch = (app, route) => {
	return supertest(app.server.httpServer).get(route)
}

// Wrapper around tape which auto-converts generators to coroutines
global.test = (name, func) => {
	if(func.constructor.name === 'GeneratorFunction')
		func = Promise.coroutine(func)

	return tape(name, func)
}

// Run all tests
fs.readdir('test', (error, files) => {
	files.forEach(file => {
		if(file === 'index.js' || file === 'app')
			return

		require('./' + file)
	})
})