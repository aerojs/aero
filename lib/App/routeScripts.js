const compress = require('brotli').compress
const etag = require('etag')

module.exports = function() {
	let js = '"use strict";' + (this.liveReload ? this.liveReload.script : '') + this.pluginScripts.join(';') + this.js.map(script => script.code).join(';')

	// Headers
	this.compressedScriptsHeaders = {
		'Content-Type': 'application/javascript',
		'Cache-Control': 'max-age=864000'
	}

	// Compress
	try {
		this.compressedScripts = Buffer.from(compress(Buffer.from(js)))
		this.compressedScriptsHeaders['Content-Encoding'] = 'br'
		this.compressedScriptsHeaders['Content-Length'] = this.compressedScripts.length
	} catch(_) {
		this.compressedScripts = js
		this.compressedScriptsHeaders['Content-Length'] = Buffer.byteLength(this.compressedScripts, 'utf8')
	}

	this.compressedScriptsHeaders.ETag = etag(this.compressedScripts)

	// Route
	this.server.routes.GET['scripts.js'] = (request, response) => {
		if(request.headers['if-none-match'] === this.compressedScriptsHeaders.ETag) {
			response.writeHead(304, this.compressedScriptsHeaders)
			response.end()
			return
		}

		response.writeHead(200, this.compressedScriptsHeaders)
		response.end(this.compressedScripts)
	}
}