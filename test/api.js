'use strict';

let aero = require('../lib');
let assert = require('assert');

describe('api', function() {
	describe('run()', function() {
		it('should be defined', function() {
			assert(aero.run);
		});
	});

	describe('stop()', function() {
		it('should be defined', function() {
			assert(aero.stop);
		});
	});

	describe('get()', function() {
		it('should be defined', function() {
			assert(aero.get);
		});
	});

	describe('use()', function() {
		it('should be defined', function() {
			assert(aero.use);
		});
	});

	describe('on()', function() {
		it('should be defined', function() {
			assert(aero.on);
		});
	});

	describe('server', function() {
		it('should be defined', function() {
			assert(aero.server);
		});

		it('should have a routes property', function() {
			assert(aero.server.routes);
		});
	});

	describe('events', function() {
		it('should be defined', function() {
			assert(aero.events);
		});

		it('should have an on() function', function() {
			assert(aero.events.on);
		});
	});
});