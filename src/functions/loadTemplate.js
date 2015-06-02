"use strict";

let jade = require("jade");
let Promise = require("bluebird");

// loadTemplate
let loadTemplate = function(templatePath) {
	try {
		return Promise.resolve(jade.compileFile(templatePath));
	} catch(e) {
		if(e.code !== "ENOENT")
			console.error(e);

		return Promise.resolve(null);
	}
};

module.exports = loadTemplate;