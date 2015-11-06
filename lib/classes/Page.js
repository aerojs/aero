'use strict'

// Modules
let path = require('path')
let chalk = require('chalk')
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
let loadScript = require('../functions/loadScript')
let loadPageJSON = require('../functions/loadPageJSON')

// Page
let Page = Promise.coroutine(function*(id, pagePath, pageLoadCallBack) {
	this.id = id
	this.path = pagePath
	this.url = id
	this.baseName = path.basename(id)

	let getComponentPath = extension => path.resolve(path.join(this.path, this.baseName + extension))

	this.controllerPath = getComponentPath('.js')
	this.templatePath = getComponentPath('.jade')
	this.stylePath = getComponentPath('.styl')
	this.scriptPath = getComponentPath('.browser.js')
	this.jsonPath = getComponentPath('.json')

	let components = yield {
		controller: loadController(this.controllerPath),
		template: loadTemplate(this.templatePath).catch(() => null),
		css: loadStyle(this.stylePath),
		script: loadScript(this.scriptPath, false),
		json: loadPageJSON(this.jsonPath)
	}

	this.controller = components.controller
	this.template = components.template
	this.css = components.css
	this.json = components.json

	let browserScript = components.script ? `<script>document.addEventListener("DOMContentLoaded",function(){${components.script}});</script>` : ''
	let styleElement = '<style scoped>' + this.css + '</style>'

	this.wrap = function(code) {
		return styleElement + code + browserScript
	}

	// URL overwrite in JSON file
	if(this.json && typeof this.json.url !== 'undefined')
		this.url = this.json.url

	// Default controller
	if(this.controller) {
		if(!this.controller.get && !this.controller.post) {
			console.error(chalk.red(`Page controller '${id}' doesn't have a "get" or "post" method.`))
		}

		// Call init on the page controller
		if(this.controller.init)
			this.controller.init(this)
	} else {
		if(this.template) {
			this.code = this.wrap(this.template(this.json))
		} else {
			this.code = ''
		}
	}

	// Callback
	if(pageLoadCallBack)
		pageLoadCallBack(this)
})

module.exports = Page