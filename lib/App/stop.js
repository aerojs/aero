module.exports = function() {
	return this.server.stop().then(() => this.liveReload.stop())
}