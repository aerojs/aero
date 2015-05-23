let fs = require("fs");

// loadDirectory
let loadDirectory = function(directoryPath, loader, callBack) {
	fs.readdir(directoryPath, function(error, files) {
		if(error)
			throw error;

		let result = files.map(loader);

		if(callBack)
			callBack(result);
	});
};

module.exports = loadDirectory;