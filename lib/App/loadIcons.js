let fs = Promise.promisifyAll(require('fs'))
let getMIMEType = require('mime-types').lookup
let sizeOf = require('image-size')

module.exports = function*() {
	try {
		this.server.defaultIcon = yield fs.readFileAsync(this.path('favicon.ico'))
	} catch(error) {
		// Ignore default favicon load errors
	}

	// Load icons specified in config.json
	this.icons = this.config.icons.map(url => {
		let filePath = this.path(url)
		let dimensions = sizeOf(filePath)

		return {
			src: url,
			sizes: `${dimensions.width}x${dimensions.height}`,
			type: getMIMEType(filePath)
		}
	})
}