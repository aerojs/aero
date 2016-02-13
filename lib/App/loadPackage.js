const defaultPackage = require('../../default/package')

module.exports = function*() {
	let packagePath = this.path('package.json')
	let packageText = yield this.loadFile(packagePath, defaultPackage)

	this.package = Object.assign({}, defaultPackage, JSON.parse(packageText))
	Object.freeze(this.package)

	this.events.emit('package loaded')
}