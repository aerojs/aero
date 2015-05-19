let path = require("path");
let jade = require("jade");

let Page = function(id, pagePath) {
	this.id = id;
	this.path = pagePath;
	this.modulePath = path.resolve(path.join(this.path, id + ".js"));
	this.templatePath = path.resolve(path.join(this.path, id + ".jade"));
	
	// Delete existing controller from cache
	delete require.cache[this.modulePath];
	
	// Reload controller
	this.controller = require(this.modulePath);
	
	// Load template
	try {
		this.renderTemplate = jade.compileFile(this.templatePath);
	} catch(e) {
		if(e.code !== "ENOENT")
			console.error(e);
	}
};

module.exports = Page;