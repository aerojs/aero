// Modules
let path = require("path");

// Functions
let loadTemplate = require("../functions/loadTemplate");

// Layout
let Layout = function(layoutPath) {
	this.id = path.basename(layoutPath);
	this.path = layoutPath;
	this.templatePath = path.resolve(path.join(this.path, this.id + ".jade"));
	this.liveReloadScript = "<script>var ws = new WebSocket('ws://localhost:9000/');ws.onmessage = function(){location.reload();};</script>";
	this.controller = null;
	
	loadTemplate.bind(this)(function(error, renderTemplate) {
		this.renderTemplate = renderTemplate;
	}.bind(this));
};

module.exports = Layout;