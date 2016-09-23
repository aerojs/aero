let requester = Promise.promisifyAll(require('request'))

module.exports = function*(method, route) {
	// The purpose of this function is only to write stuff to the console.
	// So if writing is disabled there is nothing to do here.
	if(!this.verbose)
		return

	// We don't test static routes
	if(this.config.static.indexOf(route) !== -1)
		return

	const url = `${this.server.protocol}://localhost:${this.server.port}/${route}`
	method = method.toUpperCase()

	try {
		let startTime = new Date()

		let response = yield requester[`${method.toLowerCase()}Async`]({
			uri: url,
			timeout: 3000,
			encoding: null,
			rejectUnauthorized: false
		})

		response.time = new Date() - startTime

		// Run all checks
		yield this.linter.run(method, route, response)

		return response.statusCode
	} catch(error) {
		console.error(this.chalk.red(`Error fetching ${url}`))
		this.log(error)
	}
}