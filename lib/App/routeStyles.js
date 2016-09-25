const compress = require('iltorb').compressSync
const etag = require('etag')

module.exports = function() {
	let css = this.pluginStyles.join(' ') + this.css.map(style => style.code).join(' ')

	if(this.layout.css)
		css += this.layout.css

	if(this.fontsCSS)
		css = this.fontsCSS + css

	// Compress
	this.compressedStyles = compress(Buffer.from(css))

	// Headers
	this.compressedStylesHeaders = {
		'Content-Length': this.compressedStyles.length,
		'Content-Type': 'text/css',
		'Content-Encoding': 'br',
		'ETag': etag(this.compressedStyles),
		'Cache-Control': 'max-age=864000'
	}

	// Route
	this.server.routes.GET['styles.css'] = (request, response) => {
		response.writeHead(200, this.compressedStylesHeaders)
		response.end(this.compressedStyles)
	}
}