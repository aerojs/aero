'use strict';

let UglifyJS = require('uglify-js');

// loadScript
let loadScript = function(scriptPath) {
	return Promise.resolve(UglifyJS.minify(scriptPath).code);
};

module.exports = loadScript;