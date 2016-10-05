let fs = Promise.promisifyAll(require('fs'))
let getMIMEType = require('mime-types').lookup
let sizeOf = require('image-size')

module.exports = function*() {
	try {
		this.defaultIcon = yield fs.readFileAsync(this.path('favicon.ico'))

		// Default favicon route
		this.server.routes.GET['favicon.ico'] = (request, response) => {
			response.writeHead(200, {
				'Content-Type': 'image/x-icon',
				'Content-Length': this.defaultIcon.length,
				'Cache-Control': 'max-age=864000'
			})
			response.end(this.defaultIcon)
		}
	} catch(error) {
		// Ignore default favicon load errors
		this.server.routes.GET['favicon.ico'] = (request, response) => {
			response.writeHead(404)
			response.end()
		}
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