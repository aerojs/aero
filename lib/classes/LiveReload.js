'use strict'

let WebSocketServer = require('ws').Server
let Promise = require('bluebird')

class LiveReload {
	constructor(security, port) {
		let app = null
		let protocol = null

		if(security && security.key && security.cert) {
			app = require('http2').createServer(security, this.processRequest)
			protocol = 'wss'
		} else {
			app = require('http').createServer(this.processRequest)
			protocol = 'ws'
		}

		this.httpServer = app;

		// Script for each page in dev mode
		this.script = `var ws = new WebSocket('${protocol}://localhost:${port}/');ws.onmessage = function(){location.reload();};`

		// Listen
		app.listen(port, function(error) {
			if(error)
				throw error

			this.server = new WebSocketServer({
				server: app
			})
		}.bind(this))
	}

	broadcast(data) {
		if(!this.server)
			return

		// Broadcast data to all clients
		this.server.clients.forEach(function(client) {
			client.send(data)
		})
	}

	processRequest(request, response) {
		response.writeHead(200)
		response.end('Aero WebSockets!\n')
	}

	stop() {
		// Close all client connections
		this.server.clients.forEach(client => client.close())
		this.server.close()

		let closeAsync = Promise.promisify(this.httpServer.close, this.httpServer)
		//let closeWebSocketAsync = Promise.promisify(this.server.close, this.server)

		return closeAsync() //closeWebSocketAsync().then(closeAsync)
	}
}

module.exports = LiveReload