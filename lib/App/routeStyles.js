const compress = require('brotli').compress
const etag = require('etag')

module.exports = function() {
	this.combinedCSS = this.pluginStyles.join(' ') + this.css.map(style => style.code).join(' ')

	if(this.layout.css)
		this.combinedCSS += this.layout.css

	if(this.fontsCSS)
		this.combinedCSS = this.fontsCSS + this.combinedCSS

	// Headers
	this.compressedStylesHeaders = {
		'Content-Type': 'text/css',
		'Cache-Control': 'max-age=864000'
	}

	// Compress
	try {
		this.compressedStyles = Buffer.from(compress(Buffer.from(this.combinedCSS)))
		this.compressedStylesHeaders['Content-Encoding'] = 'br'
		this.compressedStylesHeaders['Content-Length'] = this.compressedStyles.length
	} catch(_) {
		this.compressedStyles = this.combinedCSS
		this.compressedStylesHeaders['Content-Length'] = Buffer.byteLength(this.compressedStyles, 'utf8')
	}

	this.compressedStylesHeaders.ETag = etag(this.compressedStyles)

	// Route
	this.server.routes.GET['styles.css'] = (request, response) => {
		if(request.headers['if-none-match'] === this.compressedStylesHeaders.ETag) {
			response.writeHead(304, this.compressedStylesHeaders)
			response.end()
			return
		}

		let acceptEncoding = request.headers['accept-encoding']

		// This is a bit hacky but it works for now™
		if(acceptEncoding && acceptEncoding.indexOf('br') !== -1) {
			response.writeHead(200, this.compressedStylesHeaders)
			response.end(this.compressedStyles)
		} else {
			// For older browsers
			response.writeHead(200, {
				'Content-Type': 'text/css',
				'Cache-Control': 'max-age=864000',
				'Content-Length': Buffer.byteLength(this.combinedCSS, 'utf8')
			})
			response.end(this.combinedCSS)
		}
	}
}