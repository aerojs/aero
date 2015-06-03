'use strict';

let loadPageJSON = require('../src/functions/loadPageJSON');

describe('functions', function() {
	describe('loadPageJSON', function() {
		it('should not throw when the JSON file is defect', function() {
			loadPageJSON('test/defect.json');
		});
	});
});