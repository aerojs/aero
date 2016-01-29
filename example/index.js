'use strict';

let runExample = function() {
	// Change directory
	require('process').chdir(__dirname);

	// Modules
	let app = require('../lib')();

	// Special route
	app.get('/very/special/route', function(request, response) {
		response.end('Very special indeed!');
	});

	// Special route
	app.get('/api/custom', function(request, response) {
		response.end('API custom.');
	});

	// Google+ style routing
	app.get(/^\+(.*)$/, function(request, response) {
		response.write(request.params[0] + ': ');
		response.end('Google+');
	});

	// Middleware
	app.use(function(req, res, next) {
		//console.log('URL:', req.url);
		next();
	});

	app.use(function(req, res, next) {
		//console.log('Time:', new Date());
		next();
	});

	return app
};

if(module === require.main)
	runExample();
else
	module.exports = runExample;