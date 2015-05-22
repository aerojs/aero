// Modules
let path = require("path");
let async = require("async");

// Functions
let loadController = require("../functions/loadController");
let loadTemplate = require("../functions/loadTemplate");
let loadStyle = require("../functions/loadStyle");
let loadPageJSON = require("../functions/loadPageJSON");

// Layout
let Layout = function(layoutPath, layoutLoadCallBack) {
	this.id = path.basename(layoutPath);
	this.path = layoutPath;
	this.controller = null;

	this.controllerPath = path.resolve(path.join(this.path, this.id + ".js"));
	this.templatePath = path.resolve(path.join(this.path, this.id + ".jade"));
	this.jsonPath = path.resolve(path.join(this.path, this.id + ".json"));
	this.stylePath = path.resolve(path.join(this.path, this.id + ".styl"));

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

		// Controller.init
		if(this.controller.init)
			this.controller.init(this);

		// Send event that the layout is ready
		if(layoutLoadCallBack)
			layoutLoadCallBack(this);
	}.bind(this));
};

module.exports = Layout;