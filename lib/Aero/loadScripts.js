module.exports = function*() {
	this.time('Scripts')

	yield Promise.resolve()

	this.timeEnd('Scripts')
}