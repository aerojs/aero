module.exports = Promise.coroutine(function*() {
	if(this.redirectServer) {
		let close = Promise.promisify(this.redirectServer.close, {context: this.redirectServer})
		this.redirectServer.closeSockets()
		yield close()
	}

	if(this.http) {
		let close = Promise.promisify(this.http.close, {context: this.http})
		this.http.closeSockets()
		yield close()
	}
})