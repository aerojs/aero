let fs = require('fs')
let tape = require('blue-tape')
let tapDiff = require('tap-diff')
let supertest = require('supertest-as-promised')

// Colorize
tape.createStream().pipe(tapDiff()).pipe(process.stdout)

// Global variables in tests
global.aero = require('../lib')
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
global.rmdir = function(dirPath, removeSelf) {
	removeSelf = removeSelf !== undefined ? removeSelf : true

	try {
		var files = fs.readdirSync(dirPath)
	} catch(e) {
		console.error(e)
		return
	}

	for(let file of files) {
		if(file === '.gitignore')
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
fs.readdir('test/tests', (error, files) => {
	files.forEach(file => require('./tests/' + file))
})