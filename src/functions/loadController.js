// loadController
let loadController = function(next) {
	// Delete existing controller from cache
	delete require.cache[this.modulePath];

	// Load the js file
	try {
		let controller = require(this.modulePath);
		next(null, controller);
	} catch(e) {
		if(e.code !== "MODULE_NOT_FOUND")
			console.error(e);

		next(null, null);
	}
};

module.exports = loadController;