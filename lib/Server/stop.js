module.exports = function() {
	if(!this.httpServer)
		return Promise.resolve()

	let closeAsync = Promise.promisify(this.httpServer.close, {context: this.httpServer})
	return closeAsync()
}