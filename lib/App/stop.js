module.exports = function*() {
	yield this.server.stop()

	if(this.liveReload)
		yield this.liveReload.stop()
}