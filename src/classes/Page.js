// Modules
let async = require("async");
let path = require("path");

// Functions
let loadController = require("../functions/loadController");
let loadTemplate = require("../functions/loadTemplate");
let loadStyle = require("../functions/loadStyle");
let loadPageJSON = require("../functions/loadPageJSON");

// Page
let Page = function(id, pagePath, pageLoadCallBack) {
	this.id = id;
	this.path = pagePath;
	this.url = id;

	this.controllerPath = path.resolve(path.join(this.path, id + ".js"));
	this.templatePath = path.resolve(path.join(this.path, id + ".jade"));
	this.stylePath = path.resolve(path.join(this.path, id + ".styl"));
	this.jsonPath = path.resolve(path.join(this.path, id + ".json"));

	async.parallel({
		controller: loadController.bind(this),
		renderTemplate: loadTemplate.bind(this),
		css: loadStyle.bind(this),
		json: loadPageJSON.bind(this)
	}, function(error, data) {
		// Update myself
		this.renderTemplate = data.renderTemplate;
		this.css = data.css;
		this.controller = data.controller;
		this.json = data.json;

		// URL overwrite in JSON file
		if(this.json && typeof this.json.url !== "undefined")
			this.url = this.json.url;

		// Default controller
		if(this.controller) {
			// Automatic "get" creation
			if(this.controller.render && !this.controller.get) {
				let page = this;

				this.controller.get = function(request, response) {
					this.render(request, function(params) {
						response.end(page.renderTemplate(params));
					});
				};
			}

			// Call init on the page controller
			if(this.controller.init)
				this.controller.init(this);
		} else {
			if(this.renderTemplate) {
				this.code = "<style scoped>" + this.css + "</style>" + this.renderTemplate(this.json);
			} else {
				this.code = "";
			}
		}

		// Callback
		if(pageLoadCallBack)
			pageLoadCallBack(this);
	}.bind(this));
};

module.exports = Page;