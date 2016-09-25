const compress = require('iltorb').compressSync

module.exports = function() {
	let css = this.pluginStyles.join(' ') + this.css.map(style => style.code).join(' ')

	if(this.layout.css)
		css += this.layout.css

	if(this.fontsCSS)
		css = this.fontsCSS + css

	// Compress
	this.compressedStyles = compress(Buffer.from(css))

	// Route
	this.server.routes.GET['styles.css'] = (request, response) => {
		response.writeHead(200, {
			// 'Content-Length': this.compressedStyles.length,
			'Content-Type': 'text/css',
			'Content-Encoding': 'br'
		})
		response.end(this.compressedStyles)
	}
}