module.exports = function() {
	if(!this.httpServer)
		return Promise.resolve()

	let close = Promise.promisify(this.httpServer.close, {context: this.httpServer})
	return close()
}