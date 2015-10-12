'use strict';

let chalk = require('chalk');
let UglifyJS = require('uglify-js');

// loadScript
let loadScript = function(scriptPath) {
	try {
		let code = UglifyJS.minify(scriptPath).code;
		return Promise.resolve(code);
	} catch(e) {
		console.error(chalk.red(e));
		return '';
	}
};

module.exports = loadScript;