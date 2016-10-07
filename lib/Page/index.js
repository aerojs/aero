let loadClass = require('../loadClass')
let path = require('path')

class Page {
	constructor(app, id, realPath) {
		this.id = id
		this.app = app
		this.url = id   // Unlike the id, url can be changed by the user
		this.baseName = path.basename(id)
		this.path = realPath

		this.defaultParams = {
			app,
			page: this
		}

		Object.freeze(this.defaultParams)
	}
}

module.exports = loadClass(Page, __dirname)