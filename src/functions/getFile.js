let fs = require("fs");

// writeFile
let writeFile = function(filePath, defaultData, callBack) {
	fs.writeFile(filePath, defaultData, "utf8", function(writeError) {
		if(writeError)
			throw writeError;
	});
	
	callBack(defaultData);
};

// readFile
let readFile = function(filePath, callBack) {
	fs.readFile(filePath, "utf8", function(readError, data) {
		if(readError)
			throw readError;
		
		callBack(data);
	});
};

// getFile
let getFile = function(filePath, defaultData, callBack) {
	if(typeof defaultData === "object")
		defaultData = JSON.stringify(defaultData, null, "\t");
	
	// File exists?
	fs.stat(filePath, function(statError, stats) {
		// If it doesn't exist we'll create it with the default data.
		// If it already exists we'll read it from the file system.
		if(statError || !stats.isFile())
			writeFile(filePath, defaultData, callBack);
		else
			readFile(filePath, callBack);
	});
};

module.exports = getFile;