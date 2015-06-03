'use strict';

let fs = require('fs');
let Promise = require('bluebird');

// Promisify
Promise.promisifyAll(fs);

// loadPageJSON
let loadPageJSON = function(jsonPath) {
	return fs.readFileAsync(jsonPath, 'utf8').then(function(fileContents) {
		return Promise.resolve(JSON.parse(fileContents));
	}).error(function(readError) {
		if(readError.code !== 'ENOENT')
			console.error(readError);

		return Promise.resolve(null);
	});
};

module.exports = loadPageJSON;