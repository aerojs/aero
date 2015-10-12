'use strict';

let runExample = function (silent) {
	// Modules
	let aero = require('../lib');

	// Change directory
	require('process').chdir(__dirname);

	// Run
	aero.run();

	// Special route
	aero.get('/very/special/route', function(request, response) {
		response.end('Very special indeed!');
	});

	// Google+ style routing
	aero.get(/^\+(.*)$/, function(request, response) {
		response.write(request.params[0] + '\n');
		response.end('Google+ style routing');
	});

	// Middleware
	aero.use(function(req, res, next) {
		//console.log('URL:', req.url);
		next();
	});

	aero.use(function(req, res, next) {
		//console.log('Time:', new Date());
		next();
	});
};

if(module === require.main)
	runExample();
else
	module.exports = runExample;