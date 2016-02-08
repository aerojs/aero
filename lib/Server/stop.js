module.exports = Promise.coroutine(function*() {
	if(!this.httpServer)
		return

	let closeHTTPServer = Promise.promisify(this.httpServer.close, {context: this.httpServer})
	this.httpServer.closeSockets()
	yield closeHTTPServer()

	if(!this.redirectServer)
		return

	let closeRedirectServer = Promise.promisify(this.redirectServer.close, {context: this.redirectServer})
	this.redirectServer.closeSockets()
	yield closeRedirectServer()
})