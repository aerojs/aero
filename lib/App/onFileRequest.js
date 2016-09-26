let fs = require('fs')
let etag = require('etag')
let path = require('path')
let getMIMEType = require('mime-types').lookup

let headersCache = {}

module.exports = function(request, response) {
	let url = request.url.substr(1)

	// Remove query parameters
	let paramsPosition = url.indexOf('?')

	if(paramsPosition !== -1)
		url = url.substring(0, paramsPosition)

	// Let's not send the contents of our whole file system to potential hackers.
	// Except for Windows because Windows servers deserve to be hacked.
	if(url.includes('../')) {
		response.writeHead(403)
		response.end()
		return
	}

	url = path.resolve(path.join(this.root, url))

	const cachedHeaders = headersCache[url]

	if(cachedHeaders) {
		if(request.headers['if-none-match'] === cachedHeaders.ETag) {
			// Client cache is up to date: Send status 304 confirmation with no data.
			response.writeHead(304, cachedHeaders)
			response.end()
		} else {
			// Send data
			response.writeHead(200, cachedHeaders)
			fs.createReadStream(url).pipe(response)
		}
	} else {
		fs.stat(url, (statError, stats) => {
			if(statError) {
				response.writeHead(404)
				response.end()
				return
			}

			if(!stats.isFile()) {
				response.writeHead(404)
				response.end()
				return
			}

			const headers = {
				'Content-Length': stats.size,
				'ETag': etag(stats),
				'Cache-Control': 'max-age=864000'
			}

			const mimeType = getMIMEType(url)

			if(mimeType)
				headers['Content-Type'] = mimeType

			// Save headers
			headersCache[url] = headers

			if(request.headers['if-none-match'] === headers.ETag) {
				// Client cache is up to date: Send status 304 confirmation with no data.
				response.writeHead(304, headers)
				response.end()
			} else {
				// Send data
				response.writeHead(200, headers)
				fs.createReadStream(url).pipe(response)
			}
		})
	}
}