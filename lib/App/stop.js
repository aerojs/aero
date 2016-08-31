module.exports = function() {
	return this.server.stop().then(() => {
		if(this.liveReload)
			return this.liveReload.stop()
	})
}