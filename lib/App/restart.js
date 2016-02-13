module.exports = function*() {
	yield this.stop()
	yield this.run()
}