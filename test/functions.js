'use strict';

let assert = require('assert');

describe('functions', function() {
	describe('loadPageJSON', function() {
		let loadPageJSON = require('../lib/functions/loadPageJSON');

		it('should not throw when the JSON file does not exist', function(done) {
			loadPageJSON('test/does not exist.hjson').then(done);
		});

		it('should not throw when the JSON file is defect', function(done) {
			loadPageJSON('test/defect.hjson').then(done);
		});
	});

	describe('loadFavIcon', function() {
		let loadFavIcon = require('../lib/functions/loadFavIcon');

		it('should not throw when the favicon does not exist', function(done) {
			loadFavIcon('test/does not exist.ico', function(imageData) {
				assert(imageData === null);
				done();
			});
		});
	});
});