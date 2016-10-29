const compress = require('brotli').compress
const xxhash = require('xxhash')

module.exports = function() {
	const combinedJS = '"use strict";' + (this.liveReload ? this.liveReload.script : '') + this.pluginScripts.join(';') + this.js.map(script => script.code).join(';')

	if(typeof combinedJS !== 'string')
		throw combinedJS

	// Headers
	const compressedScriptsHeaders = {
		'Content-Type': 'application/javascript',
		'Cache-Control': 'max-age=864000'
	}

	// Compress
	let compressedScripts = null
	try {
		if(compressedScripts.length <= 1450)
			throw 'Not worth compressing'

		compressedScripts = Buffer.from(compress(Buffer.from(combinedJS)))
		compressedScriptsHeaders['Content-Encoding'] = 'br'
		compressedScriptsHeaders['Content-Length'] = compressedScripts.length
	} catch(_) {
		compressedScripts = combinedJS
		compressedScriptsHeaders['Content-Length'] = Buffer.byteLength(compressedScripts, 'utf8')
	}

	compressedScriptsHeaders.ETag = xxhash.hash(Buffer.from(compressedScripts), 0)

	// Route
	this.server.routes.GET['scripts.js'] = (request, response) => {
		if(request.headers['if-none-match'] === compressedScriptsHeaders.ETag) {
			response.writeHead(304, compressedScriptsHeaders)
			response.end()
			return
		}

		let acceptEncoding = request.headers['accept-encoding']

		// This is a bit hacky but it works for now™
		if(acceptEncoding && acceptEncoding.indexOf('br') !== -1) {
			response.writeHead(200, compressedScriptsHeaders)
			response.end(compressedScripts)
		} else {
			// For older browsers
			response.writeHead(200, {
				'Content-Type': 'application/javascript',
				'Cache-Control': 'max-age=864000',
				'Content-Length': Buffer.byteLength(combinedJS, 'utf8')
			})
			response.end(combinedJS)
		}
	}
}