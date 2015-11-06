'use strict';

let aero = require('../lib');
let assert = require('assert');

describe('api', function() {
	it('aero.run', function() {
		assert(aero.run);
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

	it('aero.stop', function() {
		assert(aero.stop);
	});
});