const compress = require('brotli').compress
const xxhash = require('xxhash')

module.exports = function() {
	this.combinedCSS = this.pluginStyles.join(' ') + this.css.map(style => style.code).join(' ')

	if(this.layout.css)
		this.combinedCSS += this.layout.css

	if(this.fontsCSS)
		this.combinedCSS = this.fontsCSS + this.combinedCSS

	// Headers
	const compressedStylesHeaders = {
		'Content-Type': 'text/css',
		'Cache-Control': 'max-age=864000'
	}

	// Compress
	let compressedStyles = null
	try {
		compressedStyles = Buffer.from(compress(Buffer.from(this.combinedCSS)))
		compressedStylesHeaders['Content-Encoding'] = 'br'
		compressedStylesHeaders['Content-Length'] = compressedStyles.length
	} catch(_) {
		compressedStyles = this.combinedCSS
		compressedStylesHeaders['Content-Length'] = Buffer.byteLength(compressedStyles, 'utf8')
	}

	compressedStylesHeaders.ETag = xxhash.hash(Buffer.from(compressedStyles), 0)

	// Route
	this.server.routes.GET['styles.css'] = (request, response) => {
		if(request.headers['if-none-match'] === compressedStylesHeaders.ETag) {
			response.writeHead(304, compressedStylesHeaders)
			response.end()
			return
		}

		let acceptEncoding = request.headers['accept-encoding']

		// This is a bit hacky but it works for now™
		if(acceptEncoding && acceptEncoding.indexOf('br') !== -1) {
			response.writeHead(200, compressedStylesHeaders)
			response.end(compressedStyles)
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