const ipv6Enabled = true
const host = ipv6Enabled ? '::' : '127.0.0.1'

let run = function(app) {
	const config = app.config
	const security = app.security

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

		this.lib = require('spdy')
		this.http = this.lib.createServer(options, this.onRequest.bind(this))

		// Set up a permanent redirection to HTTPS
		this.redirectServer = require('http').createServer((request, response) => {
			// If there is a proxy sending our HTTP contents to an HTTPS client we allow
			// accessing the contents directly via HTTP without redirecting to HTTPS.
			if(request.headers['x-forwarded-proto'] === 'https') {
				request.fromProxy = true
				return this.onRequest(request, response)
			}

			// In production mode we allow local proxy servers to access HTTP contents.
			if(app.production) {
				let remoteAddress = request.connection.remoteAddress

				if(remoteAddress === '::ffff:127.0.0.1' || remoteAddress === '127.0.0.1') {
					request.fromProxy = true
					return this.onRequest(request, response)
				}
			}

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
		}).listen(config.ports.http, host)

		this.trackConnections(this.redirectServer)
	} else {
		this.protocol = 'http'
		this.port = config.ports.http
		this.lib = require('http')
		this.http = this.lib.createServer(this.onRequest.bind(this))
	}

	this.trackConnections(this.http, this)

	let listen = Promise.promisify(this.http.listen, {context: this.http})
	return listen(this.port, host)
}

module.exports = function(config, security) {
	return this.ready = run.bind(this)(config, security)
}