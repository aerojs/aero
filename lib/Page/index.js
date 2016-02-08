let extendClass = require('../extendClass')
let path = require('path')

class Page {
	constructor(app, id, pagePath) {
		this.id = id
		this.app = app
		this.path = pagePath
		this.url = id

		let getComponentPath = extension => path.resolve(path.join(this.path, this.id + extension))

		this.controllerPath = getComponentPath('.js')
		this.templatePath = getComponentPath('.jade')
		this.stylePath = getComponentPath('.styl')
		this.scriptPath = getComponentPath('.client.js')
		this.jsonPath = getComponentPath('.json')

		this.defaultParams = {
			app,
			page: this
		}
	}
}

module.exports = extendClass(Page, __dirname)