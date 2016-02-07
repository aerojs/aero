let extendClass = require('../extendClass')
let path = require('path')

class Layout {
	constructor(app, layoutPath) {
		this.id = path.basename(layoutPath)
		this.app = app
		this.path = layoutPath
		this.controller = null

		let getComponentPath = extension => path.resolve(path.join(this.path, this.id + extension))

		this.controllerPath = getComponentPath('.js')
		this.templatePath = getComponentPath('.jade')
		this.stylePath = getComponentPath('.styl')
		this.jsonPath = getComponentPath('.json')
	}
}

extendClass(Layout, __dirname)
module.exports = Layout