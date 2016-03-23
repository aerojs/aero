let http = require('http')
let fs = require('fs')
let path = require('path')
let getMIMEType = require('mime-types').lookup

http.ServerResponse.prototype.sendFile = function(file) {
	fs.stat(file, (statError, stats) => {
		if(statError) {
			response.writeHead(404)
			return response.end()
		}

		if(!stats.isFile()) {
			response.writeHead(404)
			return response.end()
		}

		let headers = {
			'Content-Length': stats.size
		}

		let mimeType = getMIMEType(file)

		if(mimeType)
			headers['Content-Type'] = mimeType

		if(!this.headersSent)
			this.writeHead(200, headers)

		fs.createReadStream(file).pipe(this)
	})
}