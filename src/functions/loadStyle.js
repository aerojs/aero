let fs = require("fs");
let stylus = require("stylus");
let Promise = require("bluebird");

// Promisify
Promise.promisifyAll(fs);

// loadStyle
let loadStyle = function(stylePath) {
	return fs.readFileAsync(stylePath, "utf8").then(function(styleCode) {
		let style = stylus(styleCode);
		let compileStyle = Promise.promisify(style.set("compress", true).render, style);

		return compileStyle().catch(console.error);
	}).error(function(readError) {
		if(readError.code !== "ENOENT")
			console.error(readError);

		return Promise.resolve(null);
	});
};

module.exports = loadStyle;