let path = require("path");

let Page = function(id, pagePath) {
	this.id = id;
	this.modulePath = path.resolve(path.join(pagePath, id + ".js"));
	
	// Delete existing controller from cache
	delete require.cache[this.modulePath];
	
	// Reload controller
	this.controller = require(this.modulePath);
};

module.exports = Page;