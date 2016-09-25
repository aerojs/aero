const compress = require('iltorb').compressSync

module.exports = function() {
	let js = '"use strict";' + (this.liveReload ? this.liveReload.script : '') + this.pluginScripts.join(';') + this.js.map(script => script.code).join(';')

	// Compress
	this.compressedScripts = compress(Buffer.from(js))

	// Route
	this.server.routes.GET['scripts.js'] = (request, response) => {
		response.writeHead(200, {
			// 'Content-Length': this.compressedScripts.length,
			'Content-Type': 'application/javascript',
			'Content-Encoding': 'br'
		})
		response.end(this.compressedScripts)
	}
}