let fs = Promise.promisifyAll(require('fs'))
let path = require('path')

module.exports = function*() {
	let components = yield {
		controller: this.app.loadController(this.controllerPath),
		template: this.app.loadTemplate(this.templatePath),
		css: this.app.loadStyle(this.stylePath),
		json: this.app.loadJSON(this.jsonPath),
		files: fs.readdirAsync(this.path).filter(file => fs.statAsync(path.join(this.path, file)).then(stat => stat.isFile()))
	}

	Object.assign(this, components)

	if(!this.template)
		this.template = yield this.app.loadTemplate(require.resolve('../../default/layout.pug'))

	// Controller.init
	if(this.controller && this.controller.init)
		this.controller.init(this)
}