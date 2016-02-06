let extendClass = require('../extendClass')

require('./response/redirect')
require('./response/json')

class Server {
	constructor() {
		this.routes = {
			GET: {
				'favicon.ico': (request, response) => {
					response.writeHead(404)
					response.end()
				},

				'robots.txt': (request, response) => {
					response.writeHead(200)
					response.end('User-agent: *\nDisallow: /_/\nAllow: /')
				}
			},
			POST: {}
		}

		this.raw = {
			GET: {},
			POST: {}
		}

		this.regexRoutes = {
			GET: new Set(),
			POST: new Set()
		}

		this.modifiers = []
		this.rewrite = null
		this.http = null
		this.protocol = ''
		this.port = null
	}
}

extendClass(Server, __dirname)

module.exports = Server