// Modules
let path = require("path");

// Functions
let loadController = require("../functions/loadController");
let loadTemplate = require("../functions/loadTemplate");

// Layout
let Layout = function(layoutPath) {
	this.id = path.basename(layoutPath);
	this.path = layoutPath;
	this.controllerPath = path.resolve(path.join(this.path, this.id + ".js"));
	this.templatePath = path.resolve(path.join(this.path, this.id + ".jade"));
	this.liveReloadScript = "var ws = new WebSocket('ws://localhost:9000/');ws.onmessage = function(){location.reload();};";
	this.controller = null;

	// Template
	loadTemplate.bind(this)(function(error, renderTemplate) {
		this.renderTemplate = renderTemplate;
	}.bind(this));

	// Controller
	loadController.bind(this)(function(error, controller) {
		this.controller = controller;
	}.bind(this));

	// Controller.init
	if(this.controller.init)
		this.controller.init(this);
};

module.exports = Layout;