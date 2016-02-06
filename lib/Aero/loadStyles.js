module.exports = function*() {
	this.time('Styles')
	
	yield Promise.resolve()

	this.timeEnd('Styles')
}