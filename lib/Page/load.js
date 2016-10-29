let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let chalk = require('chalk')

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

const loaders = {
	'.js': {
		name: 'controller',
		method: 'loadController'
	},
	'.pug': {
		name: 'template',
		method: 'loadTemplate'
	},
	'.styl': {
		name: 'css',
		method: 'loadStyle'
	},
	'.client.js': {
		name: 'script',
		method: 'loadScript'
	},
	'.md': {
		name: 'markdown',
		method: 'loadText'
	},
	'.json': {
		name: 'json',
		method: 'loadJSON'
	},
	'.jsonld': {
		name: 'linkedData',
		method: 'loadJSON'
	}
}

const allowedHTTPVerbs = {
	'get': true,
	'post': true
}

module.exports = function*() {
	let components = {}

	this.files = yield fs.readdirAsync(this.path).filter(file => fs.statAsync(path.join(this.path, file)).then(stat => stat.isFile()))
	this.files.forEach(file => {
		let dot = file.indexOf('.')

		if(dot === -1)
			return

		if(file.slice(0, dot) !== this.baseName)
			return

		let extension = file.slice(dot)
		let loader = loaders[extension]

		if(!loader)
			return

		components[loader.name] = this.app[loader.method](path.resolve(path.join(this.path, file)))
	})

	Object.assign(this, yield components)

	// This is the most beautiful script I've seen in my life...
	let browserScript = this.script ? `<script>"use strict";var _e='DOMContentLoaded';var _f=function(){document.removeEventListener(_e,_f);${this.script}};if(document.readyState!=='loading'){_f();}else{document.addEventListener(_e,_f);}</script>` : ''
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
			this.html = this.template(params)
			this.code = this.wrap(this.html)
		} else {
			if(this.markdown) {
				this.html = this.app.markdown(this.markdown)
				this.code = this.wrap(this.html)
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