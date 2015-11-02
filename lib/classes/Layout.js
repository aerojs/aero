'use strict'

// Modules
let path = require('path')
let chalk = require('chalk')
let Promise = require('bluebird')

// Functions
let loadController = require('../functions/loadController')
let loadTemplate = require('../functions/loadTemplate')
let loadStyle = require('../functions/loadStyle')
let loadPageJSON = require('../functions/loadPageJSON')

// Layout
let Layout = Promise.coroutine(function*(layoutPath, layoutLoadCallBack) {
	this.id = path.basename(layoutPath)
	this.path = layoutPath
	this.controller = null

	let getComponentPath = extension => path.resolve(path.join(this.path, this.id + extension))

	this.controllerPath = getComponentPath('.js')
	this.templatePath = getComponentPath('.jade')
	this.stylePath = getComponentPath('.styl')
	this.jsonPath = getComponentPath('.json')

	let components = yield {
		controller: loadController(this.controllerPath),
		template: loadTemplate(this.templatePath).catch(function(e) {
			return loadTemplate(require.resolve('../../default/layout.jade'))
		}),
		css: loadStyle(this.stylePath),
		json: loadPageJSON(this.jsonPath)
	}

	this.controller = components.controller
	this.template = components.template
	this.css = components.css
	this.json = components.json

	// Controller.init
	if(this.controller && this.controller.init)
		this.controller.init(this)

	// Send event that the layout is ready
	if(layoutLoadCallBack)
		layoutLoadCallBack(this)

	return Promise.resolve(this)
})

module.exports = Layout