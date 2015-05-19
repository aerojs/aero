// Modules
let async = require("async");
let path = require("path");

// Functions
let loadController = require("../functions/loadController");
let loadTemplate = require("../functions/loadTemplate");
let loadStyle = require("../functions/loadStyle");

// Page
let Page = function(id, pagePath, pageLoadCallBack) {
	this.id = id;
	this.path = pagePath;
	this.modulePath = path.resolve(path.join(this.path, id + ".js"));
	this.templatePath = path.resolve(path.join(this.path, id + ".jade"));
	this.stylePath = path.resolve(path.join(this.path, id + ".styl"));
	this.css = "";
	
	async.parallel({
		controller: loadController.bind(this),
		render: loadTemplate.bind(this),
		css: loadStyle.bind(this)
	}, function(error, data) {
		// Update myself
		this.render = data.render;
		this.css = data.css;
		this.controller = data.controller;
		
		// Default controller
		if(!this.controller) {
			if(this.render) {
				// Static page controller
				this.controller = {
					code: "<style scoped>" + this.css + "</style>" + this.render(),
					
					get: function(request, response) {
						response.end(this.code);
					}
				};
			} else {
				// Empty controller
				this.controller = {
					get: function(request, response) {
						response.end();
					}
				};
			}
		}
		
		// Call init on the page controller
		if(this.controller.init)
			this.controller.init(this);
		
		// Callback
		if(pageLoadCallBack)
			pageLoadCallBack(this);
	}.bind(this));
};

module.exports = Page;