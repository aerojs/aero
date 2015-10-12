'use strict';

let UglifyJS = require('uglify-js');

// loadScript
let loadScript = function(scriptPath) {
	try {
		let code = UglifyJS.minify(scriptPath).code;
		return Promise.resolve(code);
	} catch(e) {
		console.error(e);
		return '';
	}
};

module.exports = loadScript;