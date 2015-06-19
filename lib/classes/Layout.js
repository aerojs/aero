'use strict';

// Modules
let path = require('path');
let Promise = require('bluebird');

// Functions
let loadController = require('../functions/loadController');
let loadTemplate = require('../functions/loadTemplate');
let loadStyle = require('../functions/loadStyle');
let loadPageJSON = require('../functions/loadPageJSON');

// Layout
let Layout = Promise.coroutine(function*(layoutPath, layoutLoadCallBack) {
	this.id = path.basename(layoutPath);
	this.path = layoutPath;
	this.controller = null;

	// TODO: Can we abstract this even better to follow the DRY principle?
	this.controllerPath = path.resolve(path.join(this.path, this.id + '.js'));
	this.templatePath = path.resolve(path.join(this.path, this.id + '.jade'));
	this.stylePath = path.resolve(path.join(this.path, this.id + '.styl'));
	this.jsonPath = path.resolve(path.join(this.path, this.id + '.json'));
	
	let components = yield {
		controller: loadController(this.controllerPath),
		template: loadTemplate(this.templatePath).error(function() {
			return loadTemplate(require.resolve('../../default/layout.jade'));
		}),
		css: loadStyle(this.stylePath),
		json: loadPageJSON(this.jsonPath)
	};

	this.controller = components.controller;
	this.template = components.template;
	this.css = components.css;
	this.json = components.json;
	
	// Controller.init
	if(this.controller && this.controller.init)
		this.controller.init(this);

	// Send event that the layout is ready
	if(layoutLoadCallBack)
		layoutLoadCallBack(this);

	return Promise.resolve(this);
});

module.exports = Layout;