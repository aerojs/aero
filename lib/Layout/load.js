module.exports = function*() {
	let components = yield {
		controller: this.app.loadController(this.controllerPath),
		template: this.app.loadTemplate(this.templatePath),
		css: this.app.loadStyle(this.stylePath),
		json: this.app.loadJSON(this.jsonPath)
	}

	Object.assign(this, components)

	if(!this.template)
		this.template = yield this.app.loadTemplate(require.resolve('../../default/layout.jade'))

	// Controller.init
	if(this.controller && this.controller.init)
		this.controller.init(this)
}