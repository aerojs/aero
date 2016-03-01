// Allowed http methods
const allowedHTTPVerbs = {
	'get': true,
	'post': true
}

module.exports = function*() {
	let components = yield {
		controller: this.app.loadController(this.controllerPath),
		template: this.app.loadTemplate(this.templatePath),
		css: this.app.loadStyle(this.stylePath),
		script: this.app.loadScript(this.scriptPath),
		json: this.app.loadJSON(this.jsonPath)
	}

	Object.assign(this, components)

	// This is the most beautiful script I've seen in my life...
	let browserScript = this.script ? `<script>var _event='DOMContentLoaded';var _func=function(){document.removeEventListener(_event,_func);${components.script}};if(document.readyState==='complete'){_func();}else{document.addEventListener(_event,_func);}</script>` : ''
	let styleElement = `<style scoped>${this.css}</style>`

	this.wrap = code => styleElement + code + browserScript

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
			console.error(chalk.red(`Page controller '${id}' doesn't have a "get" or "post" method.`))
		}

		// This will be an array that consists of request methods that have been implemented by the controller.
		// e.g. ['get', 'post'] or in most cases just ['get']
		this.httpVerbs = Object.getOwnPropertyNames(this.controller)
		.filter(property => allowedHTTPVerbs[property] && (typeof this.controller[property]) === 'function')

		// Convert generator function to coroutines automatically
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
			this.code = this.wrap(this.template(Object.assign({}, this.json, this.defaultParams)))
		} else {
			this.code = ''
		}

		this.httpVerbs = ['get']
	}
}