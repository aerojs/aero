const compress = require('brotli').compress
const etag = require('etag')

module.exports = function() {
	let css = this.pluginStyles.join(' ') + this.css.map(style => style.code).join(' ')

	if(this.layout.css)
		css += this.layout.css

	if(this.fontsCSS)
		css = this.fontsCSS + css

	// Headers
	this.compressedStylesHeaders = {
		'Content-Type': 'text/css',
		'Cache-Control': 'max-age=864000'
	}

	// Compress
	try {
		this.compressedStyles = Buffer.from(compress(Buffer.from(css)))
		this.compressedStylesHeaders['Content-Encoding'] = 'br'
		this.compressedStylesHeaders['Content-Length'] = this.compressedStyles.length
	} catch(_) {
		this.compressedStyles = css
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

		response.writeHead(200, this.compressedStylesHeaders)
		response.end(this.compressedStyles)
	}
}