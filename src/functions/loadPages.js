let fs = require("fs");

// loadPages
let loadPages = function(pagesPath, loader, callBack) {
	fs.readdir(pagesPath, function(error, pages) {
		if(error)
			throw error;

		let result = pages.map(loader);

		if(callBack)
			callBack(result);
	});
};

module.exports = loadPages;