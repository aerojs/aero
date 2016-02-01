'use strict'

function run(root) {
	let app = require('../lib')(root)

	// Special route
	app.get('/very/special/route', (request, response) => {
		response.end('Very special indeed!')
	})

	// Special route
	app.get('/api/custom', (request, response) => {
		response.end('API custom.')
	})

	// Google+ style routing
	app.get(/^\+(.*)$/, (request, response) => {
		response.write(request.params[0] + ': ')
		response.end('Google+')
	})

	// Middleware
	app.use(function(req, res, next) {
		//console.log('URL:', req.url)
		next()
	})

	app.use(function(req, res, next) {
		//console.log('Time:', new Date())
		next()
	})

	return app
}

if(require.main === module) {
	run('example')
}

module.exports = run