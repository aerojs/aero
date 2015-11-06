'use strict';

let aero = require('../lib');
let assert = require('assert');

describe('api', function() {
	it('aero.run', function() {
		assert(aero.run);
	});

	it('aero.stop', function() {
		assert(aero.stop);
	});

	it('aero.get', function() {
		assert(aero.get);
	});

	it('aero.use', function() {
		assert(aero.use);
	});

	it('aero.on', function() {
		assert(aero.on);
	});

	it('aero.server', function() {
		assert(aero.server);
	});

	it('aero.server.http', function() {
		assert(aero.server.http);
	});

	it('aero.server.protocol', function() {
		assert(aero.server.protocol);
	});
});