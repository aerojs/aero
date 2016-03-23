let extendClass = require('../extendClass')

require('./response/redirect')
require('./response/json')

class Server {
	constructor() {
		this.routes = {
			GET: {
				'favicon.ico': (request, response) => {
					// 404
					if(!this.defaultIcon) {
						response.writeHead(404)
						response.end()
						return
					}

					// Send image data
					response.writeHead(200, {
						'Content-Type': 'image/x-icon',
						'Cache-Control': 'max-age=864000'
					})
					response.end(this.defaultIcon)
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

		this.modifiers = [] // Middleware
		this.rewrite = null // Pre-routing
		this.http = null    // Node server object
		this.lib = null     // Node server module
		this.protocol = ''  // Protocol used (http or https)
		this.port = null    // Port
	}
}

module.exports = extendClass(Server, __dirname)