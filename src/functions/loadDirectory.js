let fs = require("fs");
let Promise = require("bluebird");

// Promisify
Promise.promisifyAll(fs);

// loadDirectory
let loadDirectory = function(directoryPath, loader) {
	return fs.readdirAsync(directoryPath).then(function(files) {
		return Promise.map(files, loader);
	});
};

module.exports = loadDirectory;