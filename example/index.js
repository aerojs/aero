'use strict';

let app = require('../lib')('example');

// Special route
app.get('/very/special/route', (request, response) => {
	response.end('Very special indeed!');
});

// Special route
app.get('/api/custom', (request, response) => {
	response.end('API custom.');
});

// Google+ style routing
app.get(/^\+(.*)$/, (request, response) => {
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

module.exports = app;