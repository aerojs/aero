module.exports = function*() {
	this.time('Layout')

	yield Promise.resolve()

	this.timeEnd('Layout')
}