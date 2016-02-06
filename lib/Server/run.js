let run = function(config) {
	if(config.security && config.security.key && config.security.cert) {
		this.protocol = 'https'
		this.port = config.ports.https

		let options = {
			spdy: {
				protocols: ['h2'],
				plain: false
			}
		}

		Object.assign(options, config.security)

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
		}).listen(config.ports.http, '::')
	} else {
		this.protocol = 'http'
		this.port = config.ports.http
		this.http = require('http')
		this.httpServer = this.http.createServer(this.onRequest.bind(this))
	}

	let listen = Promise.promisify(this.httpServer.listen, {context: this.httpServer})
	return listen(this.port, '::')
}

module.exports = function(config) {
	return this.ready = run.bind(this)(config)
}