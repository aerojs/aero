'use strict'

let fs = require('fs')
let etag = require('etag')
let lookup = require('mime-types').lookup

class Static {
	constructor() {
		this.cache = {}
		this.fileSizeCachingThreshold = 512 * 1024
	}

	serve(directory) {
		return (request, response) => {
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

			let cachedFile = this.cache[url]

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
					'Cache-Control': 'max-age=864000',
					'ETag': etag(stats)
				}

				let mimeType = lookup(url)

				// Cache headers
				if(mimeType)
					headers['Content-Type'] = mimeType

				// Send file
				response.writeHead(200, headers)

				// To cache or not to cache, that is the question!
				if(mimeType && mimeType.includes('image/') && stats.size <= this.fileSizeCachingThreshold) {
					fs.readFile(url, (readError, data) => {
						if(readError) {
							console.error(chalk.red(readError))
							response.writeHead(404)
							response.end()
							return
						}

						this.cache[url] = {
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
	}
}

module.exports = Static