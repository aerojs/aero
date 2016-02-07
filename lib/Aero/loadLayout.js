let Layout = require('../Layout')

module.exports = function*() {
	this.time('Layout')

	this.layout = new Layout(this.path(this.config.path.layout))
	yield this.layout.load()

	this.timeEnd('Layout')
}