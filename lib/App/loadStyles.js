let fs = Promise.promisifyAll(require('fs'))
let path = require('path')

module.exports = function*() {
	let globalStylePath = path.resolve(path.join(this.root, this.config.path.styles, 'config' + this.fileExtension.styles))

	try {
		this.globalStyle = yield fs.readFileAsync(globalStylePath)
		this.globalStyle += '\n'
	} catch(error) {
		if(error.code !== 'ENOENT' || error.path !== globalStylePath)
			this.log(error)

		this.globalStyle = null
	}

	this.css = yield this.loadDirectory('styles')
	this.routeStyles()
}