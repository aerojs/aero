let loadClass = require('../loadClass')

require('./response')

class Server {
	constructor() {
		this.routes = {
			GET: {},
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

module.exports = loadClass(Server, __dirname)