'use strict';

let jade = require('jade');
let Promise = require('bluebird');

// loadTemplate
let loadTemplate = function(templatePath) {
	try {
		return Promise.resolve(jade.compileFile(templatePath));
	} catch(e) {
		return Promise.reject(e);
	}
};

module.exports = loadTemplate;