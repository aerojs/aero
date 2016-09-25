const compress = require('iltorb').compressSync
const etag = require('etag')

module.exports = function() {
	let js = '"use strict";' + (this.liveReload ? this.liveReload.script : '') + this.pluginScripts.join(';') + this.js.map(script => script.code).join(';')

	// Compress
	this.compressedScripts = compress(Buffer.from(js))

	// Headers
	this.compressedScriptsHeaders = {
		'Content-Length': this.compressedScripts.length,
		'Content-Type': 'application/javascript',
		'Content-Encoding': 'br',
		'ETag': etag(this.compressedScripts),
		'Cache-Control': 'max-age=864000'
	}

	// Route
	this.server.routes.GET['scripts.js'] = (request, response) => {
		response.writeHead(200, this.compressedScriptsHeaders)
		response.end(this.compressedScripts)
	}
}