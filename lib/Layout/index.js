let extendClass = require('../extendClass')
let path = require('path')

class Layout {
	constructor(app, layoutPath) {
		this.id = path.basename(layoutPath)
		this.app = app
		this.path = layoutPath

		let getComponentPath = extension => path.resolve(path.join(this.path, this.id + extension))

		this.controllerPath = getComponentPath('.js')
		this.templatePath = getComponentPath('.jade')
		this.stylePath = getComponentPath('.styl')
		this.jsonPath = getComponentPath('.json')
	}
}

module.exports = extendClass(Layout, __dirname)