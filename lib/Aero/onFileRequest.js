let fs = require('fs')
let etag = require('etag')
let path = require('path')
let lookup = require('mime-types').lookup

let cache = {}
const fileSizeCachingThreshold = 512 * 1024

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

	url = path.join(this.root, url)

	let cachedFile = cache[url]

	if(cachedFile) {
		response.writeHead(200, cachedFile.headers)
		response.end(cachedFile.data)
		return
	}

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

		let mimeType = lookup(url)

		// Cache headers
		if(mimeType)
			headers['Content-Type'] = mimeType

		// Send headers
		response.writeHead(200, headers)

		// To cache or not to cache, that is the question!
		if(mimeType && mimeType.includes('image/') && stats.size <= this.fileSizeCachingThreshold) {
			fs.readFile(url, (readError, data) => {
				if(readError) {
					this.log(readError)
					response.writeHead(404)
					response.end()
					return
				}

				cache[url] = {
					headers: headers,
					data: data
				}

				response.end(data)
			})
		} else {
			fs.createReadStream(url).pipe(response)
		}
	})
}