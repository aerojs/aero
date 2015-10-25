'use strict'

// Modules
let path = require('path')
let Promise = require('bluebird')

// New yield handler
Promise.coroutine.addYieldHandler(function(value) {
	if(typeof value === 'object')
		return Promise.props(value)
})

// Functions
let loadController = require('../functions/loadController')
let loadTemplate = require('../functions/loadTemplate')
let loadStyle = require('../functions/loadStyle')
let loadPageJSON = require('../functions/loadPageJSON')

// Page
let Page = Promise.coroutine(function*(id, pagePath, pageLoadCallBack) {
	this.id = id
	this.path = pagePath
	this.url = id
	this.baseName = path.basename(id)

	// TODO: Can we abstract this even better to follow the DRY principle?
	this.controllerPath = path.resolve(path.join(this.path, this.baseName + '.js'))
	this.templatePath = path.resolve(path.join(this.path, this.baseName + '.jade'))
	this.stylePath = path.resolve(path.join(this.path, this.baseName + '.styl'))
	this.jsonPath = path.resolve(path.join(this.path, this.baseName + '.json'))

	let components = yield {
		controller: loadController(this.controllerPath),
		template: loadTemplate(this.templatePath).error(() => null),
		css: loadStyle(this.stylePath),
		json: loadPageJSON(this.jsonPath)
	}

	this.controller = components.controller
	this.template = components.template
	this.css = components.css
	this.json = components.json

	// URL overwrite in JSON file
	if(this.json && typeof this.json.url !== 'undefined')
		this.url = this.json.url

	// Default controller
	if(this.controller) {
		// Automatic 'get' creation
		if(this.controller.render && !this.controller.get) {
			let page = this

			this.controller.get = function(request, response) {
				this.render(request, function(params) {
					response.end(page.template(params))
				})
			}
		}

		// Call init on the page controller
		if(this.controller.init)
			this.controller.init(this)
	} else {
		if(this.template) {
			this.code = '<style scoped>' + this.css + '</style>' + this.template(this.json)
		} else {
			this.code = ''
		}
	}

	// Callback
	if(pageLoadCallBack)
		pageLoadCallBack(this)
})

module.exports = Page