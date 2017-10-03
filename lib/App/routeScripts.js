const compress = require('brotli').compress
const zlib = require('zlib')

module.exports = function() {
	const combinedJS = '"use strict";' + (this.liveReload ? this.liveReload.script : '') + this.pluginScripts.join(';') + this.js.map(script => script.code).join(';')

	if(typeof combinedJS !== 'string')
		throw combinedJS

	// Headers
	const compressedScriptsHeaders = {
		'Content-Type': 'application/javascript',
		'Cache-Control': 'must-revalidate'
	}

	if(this.production)
		compressedScriptsHeaders['Cache-Control'] = 'max-age=864000'

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

	compressedScriptsHeaders.ETag = this.etag(compressedScripts)

	// Route
	this.server.routes.GET['scripts.js'] = (request, response) => {
		if(request.headers['if-none-match'] === compressedScriptsHeaders.ETag) {
			response.writeHead(304, compressedScriptsHeaders)
			response.end()
			return
		}

		let acceptEncoding = request.headers['accept-encoding']

		// Check for brotli support.
		// See: http://caniuse.com/#search=brotli
		// This is a bit hacky but it works for now™
		if(acceptEncoding && acceptEncoding.indexOf('br') !== -1) {
			response.writeHead(200, compressedScriptsHeaders)
			response.end(compressedScripts)
			return
		}

		// For browsers that don't support brotli.
		zlib.gzip(combinedJS, (error, combinedJSGzipped) => {
			response.writeHead(200, {
				'Content-Type': 'application/javascript',
				'Cache-Control': 'max-age=864000',
				'Content-Encoding': 'gzip',
				'Content-Length': combinedJSGzipped.length
			})
			response.end(combinedJSGzipped)
		})
	}
}