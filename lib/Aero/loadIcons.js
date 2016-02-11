let fs = Promise.promisifyAll(require('fs'))

module.exports = function*() {
	try {
		this.server.defaultIcon = yield fs.readFileAsync(this.path('favicon.ico'))
	} catch(error) {
		// Ignore default favicon load errors
	}
}