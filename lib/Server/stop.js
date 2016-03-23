module.exports = Promise.coroutine(function*() {
	if(!this.http)
		return

	let closeHTTPServer = Promise.promisify(this.http.close, {context: this.http})
	this.http.closeSockets()
	yield closeHTTPServer()

	if(!this.redirectServer)
		return

	let closeRedirectServer = Promise.promisify(this.redirectServer.close, {context: this.redirectServer})
	this.redirectServer.closeSockets()
	yield closeRedirectServer()
})