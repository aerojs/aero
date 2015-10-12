'use strict';

let fs = require('fs');
let chalk = require('chalk');
let Promise = require('bluebird');

// Promisify
Promise.promisifyAll(fs);

// loadPageJSON
let loadPageJSON = function(jsonPath) {
	return fs.readFileAsync(jsonPath, 'utf8')
		.then(fileContents => Promise.resolve(JSON.parse(fileContents)))
		.error(function(readError) {
			if(readError.code !== 'ENOENT')
				console.error(chalk.red(readError));

			return Promise.resolve(null);
		});
};

module.exports = loadPageJSON;