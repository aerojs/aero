module.exports = function(httpPort, httpsPort, security, callBack) {
	if(security && security.key && security.cert) {
		this.protocol = 'https'
		this.port = httpsPort

		let options = {
			spdy: {
				protocols: ['h2'],
				plain: false
			}
		}

		Object.assign(options, security)

		this.http = require('spdy')
		this.httpServer = this.http.createServer(options, this.onRequest.bind(this))

		// Set up a permanent redirection to HTTPS
		http.createServer(function(request, response) {
			let host = request.headers['host']

			if(host) {
				response.writeHead(301, {
					'Location': 'https://' + host.replace(':' + httpPort, ':' + httpsPort) + request.url
				})
				response.end()
			} else {
				response.end('Please visit this URL via HTTPS.')
				return
			}
		}).listen(httpPort, '::')
	} else {
		this.protocol = 'http'
		this.port = httpPort
		this.http = http
		this.httpServer = this.http.createServer(this.onRequest.bind(this))
	}

	this.httpServer.listen(this.port, '::', callBack)
}