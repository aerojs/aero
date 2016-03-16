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

	let cachedHeaders = headersCache[url]

	if(cachedHeaders) {
		response.writeHead(200, cachedHeaders)
		fs.createReadStream(url).pipe(response)
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

			let headers = {
				'Content-Length': stats.size,
				'ETag': etag(stats),
				'Cache-Control': 'max-age=864000'
			}

			let mimeType = getMIMEType(url)

			if(mimeType)
				headers['Content-Type'] = mimeType

			// Save headers
			headersCache[url] = headers

			// Send data
			response.writeHead(200, headers)
			fs.createReadStream(url).pipe(response)
		})
	}
}