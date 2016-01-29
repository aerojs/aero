'use strict';

let assert = require('assert');

describe('aero', function() {
	it('should have a valid package.json file', function() {
		let fs = require('fs');
		let path = require('path');
		assert(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'))));
	});
});