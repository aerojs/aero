let path = require("path");
let jade = require("jade");

let Page = function(id, pagePath) {
	this.id = id;
	this.path = pagePath;
	this.modulePath = path.resolve(path.join(this.path, id + ".js"));
	this.templatePath = path.resolve(path.join(this.path, id + ".jade"));
	
	// Load template
	try {
		this.renderTemplate = jade.compileFile(this.templatePath);
	} catch(e) {
		if(e.code !== "ENOENT")
			console.error(e);
	}
	
	// Delete existing controller from cache
	delete require.cache[this.modulePath];
	
	// Load controller
	try {
		this.controller = require(this.modulePath);
	} catch(e) {
		if(e.code !== "MODULE_NOT_FOUND")
			console.error(e);
		
		// Default static page controller
		if(this.renderTemplate) {
			this.controller = {
				code: this.renderTemplate(),
				
				get: function(request, response) {
					response.end(this.code);
				}
			};
		}
	}
};

module.exports = Page;