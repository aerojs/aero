let run = function(config, security) {
	if(security && security.key && security.cert) {
		this.protocol = 'https'
		this.port = config.ports.https

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
		this.redirectServer = require('http').createServer((request, response) => {
			// If there is a proxy sending our HTTP contents to an HTTPS client we allow
			// accessing the contents directly via HTTP without redirecting to HTTPS.
			if(request.headers['x-forwarded-proto'] === 'https')
				return this.onRequest(request, response)

			// If there's no proxy (e.g. direct browser access to HTTP) we redirect
			// the user to the HTTPS version of the page.
			let host = request.headers['host']

			if(host) {
				response.writeHead(301, {
					'Location': 'https://' + host.replace(':' + config.ports.http, ':' + config.ports.https) + request.url
				})
				response.end()
			} else {
				response.end('Please visit this URL via HTTPS.')
			}
		}).listen(config.ports.http, '::')

		this.trackConnections(this.redirectServer)
	} else {
		this.protocol = 'http'
		this.port = config.ports.http
		this.http = require('http')
		this.httpServer = this.http.createServer(this.onRequest.bind(this))
	}

	this.trackConnections(this.httpServer, this)

	let listen = Promise.promisify(this.httpServer.listen, {context: this.httpServer})
	return listen(this.port, '::')
}

module.exports = function(config, security) {
	return this.ready = run.bind(this)(config, security)
}