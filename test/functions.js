'use strict';

let assert = require('assert');

describe('functions', function() {
	describe('loadPageJSON', function() {
		let loadPageJSON = require('../src/functions/loadPageJSON');
		
		it('should not throw when the JSON file does not exist', function(done) {
			loadPageJSON('test/does not exist.json').then(done);
		});
		
		it('should not throw when the JSON file is defect', function(done) {
			loadPageJSON('test/defect.json').then(done);
		});
	});
	
	describe('loadFavIcon', function() {
		let loadFavIcon = require('../src/functions/loadFavIcon');
		
		it('should not throw when the JSON file does not exist', function(done) {
			loadFavIcon('test/does not exist.ico', function(imageData) {
				assert(imageData === null);
				done();
			});
		});
	});
});