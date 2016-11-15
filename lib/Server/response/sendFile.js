const http = require('http')
const fs = require('fs')
const path = require('path')
const getMIMEType = require('mime-types').lookup

http.ServerResponse.prototype.sendFile = function(file) {
	fs.stat(file, (statError, stats) => {
		if(statError || !stats.isFile()) {
			this.writeHead(404)
			return this.end()
		}

		const headers = {
			'Content-Length': stats.size
		}

		const mimeType = getMIMEType(file)

		if(mimeType)
			headers['Content-Type'] = mimeType

		if(!this.headersSent)
			this.writeHead(200, headers)

		fs.createReadStream(file).pipe(this)
	})
}