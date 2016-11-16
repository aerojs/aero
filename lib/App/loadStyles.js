const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

module.exports = function*() {
	let configStylePath = path.resolve(path.join(this.root, this.config.path.styles, 'config' + this.fileExtension.styles))

	try {
		this.configStyle = yield fs.readFileAsync(configStylePath)
		this.configStyle += '\n'
	} catch(error) {
		if(error.code !== 'ENOENT' || error.path !== configStylePath)
			this.log(error)

		this.configStyle = null
	}

	this.css = yield this.loadDirectory('styles')
	this.routeStyles()
}