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
		this.redirectServer = require('http').createServer(function(request, response) {
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