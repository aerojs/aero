let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let chalk = require('chalk')

// Allowed http methods
const allowedHTTPVerbs = {
	'get': true,
	'post': true
}

let freezeCurrentProperties = function(obj) {
	for(let i in obj) {
		if(obj.hasOwnProperty(i)) {
			Object.defineProperty(obj, i, {
				writable: false,
				configurable: false
			})
		}
	}
}

module.exports = function*() {
	let components = yield {
		controller: this.app.loadController(this.controllerPath),
		template: this.app.loadTemplate(this.templatePath),
		css: this.app.loadStyle(this.stylePath),
		script: this.app.loadScript(this.scriptPath),
		markdown: this.app.loadText(this.markdownPath),
		json: this.app.loadJSON(this.jsonPath),
		linkedData: this.app.loadJSON(this.linkedDataPath),
		files: fs.readdirAsync(this.path).filter(file => fs.statAsync(path.join(this.path, file)).then(stat => stat.isFile()))
	}

	Object.assign(this, components)

	// This is the most beautiful script I've seen in my life...
	let browserScript = this.script ? `<script>var _event='DOMContentLoaded';var _func=function(){document.removeEventListener(_event,_func);${components.script}};if(document.readyState==='complete'){_func();}else{document.addEventListener(_event,_func);}</script>` : ''
	let styleElement = this.css ? `<style>${this.css}</style>` : ''
	let linkedDataElement = this.linkedData ? `<script type="application/ld+json">${JSON.stringify(this.linkedData)}</script>` : ''

	this.wrap = code => styleElement + code + browserScript + linkedDataElement

	// URL overwrite in JSON file
	if(this.json) {
		if(this.json.url !== undefined)
			this.url = this.json.url

		// if(typeof this.json.regexURL !== 'undefined')
		// 	this.regexURL = this.json.regexURL
	} else {
		// Empty object
		this.json = {}
	}

	// Default controller
	if(this.controller) {
		if(!this.controller.get && !this.controller.post) {
			console.error(chalk.red(`Page controller '${this.id}' doesn't have a "get" or "post" method.`))
		}

		// This will be an array that consists of request methods that have been implemented by the controller.
		// e.g. ['get', 'post'] or in most cases just ['get']
		this.httpVerbs = Object.getOwnPropertyNames(this.controller)
		.filter(property => allowedHTTPVerbs[property] && (typeof this.controller[property]) === 'function')

		// Convert generator functions to coroutines automatically
		this.httpVerbs.forEach(verb => {
			if(this.controller[verb].constructor.name === 'GeneratorFunction')
				this.controller[verb] = Promise.coroutine(this.controller[verb])
		})

		// Set member variables for controller
		this.controller.page = this
		this.controller.app = this.app

		// Call init on the page controller
		if(this.controller.init)
			this.controller.init()
	} else {
		// Static page
		if(this.template) {
			let params = Object.assign({}, this.json, this.defaultParams)
			let html = this.template(params)
			this.code = this.wrap(html)
		} else {
			if(this.markdown) {
				let html = this.app.markdown(this.markdown)
				this.code = this.wrap(html)
			} else {
				this.code = ''
			}
		}

		this.httpVerbs = ['get']
	}

	// Pages are immutable.
	// However we'll allow new properties to be added.
	freezeCurrentProperties(this)
}