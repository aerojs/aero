let fs = require("fs");
let Promise = require("bluebird");

// Promisify
Promise.promisifyAll(fs);

// getFile
let getFile = function(filePath, defaultData) {
	if(typeof defaultData === "object")
		defaultData = JSON.stringify(defaultData, null, "\t");

	return fs.statAsync(filePath).then(function(stats) {
		// Directories
		if(!stats.isFile())
			return Promise.resolve(defaultData);

		// Normal read
		return fs.readFileAsync(filePath, "utf8");
	}).error(function() {
		// If it doesn't exist we'll create it with the default data.
		fs.writeFileAsync(filePath, defaultData, "utf8").catch(console.error);
		return Promise.resolve(defaultData);
	});
};

module.exports = getFile;