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

		this.httpServer = app

		// Script for each page in dev mode
		this.script = `var ws = new WebSocket('${protocol}://localhost:${port}/');ws.onmessage = function(){location.reload();};`

		// Listen
		app.listen(port, function(error) {
			if(error)
				throw error

			// https://github.com/websockets/ws/pull/611
			this.fixWSSBug()

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
		if(!this.server)
			return Promise.resolve()

		let closeAsync = Promise.promisify(this.httpServer.close, {context: this.httpServer})
		let closeWebSocketAsync = Promise.promisify(this.server.close, {context: this.server})

		return closeWebSocketAsync().then(() => closeAsync())
	}

	// https://github.com/websockets/ws/pull/611
	fixWSSBug() {
		WebSocketServer.prototype.close = function(callback) {
			// terminate all associated clients
			var error = null;
			try {
				for (var i = 0, l = this.clients.length; i < l; ++i) {
					this.clients[i].terminate();
				}
			}
			catch (e) {
				error = e;
			}

			// remove path descriptor, if any
			if (this.path && this._server._webSocketPaths) {
				delete this._server._webSocketPaths[this.path];
				if (Object.keys(this._server._webSocketPaths).length === 0) {
					delete this._server._webSocketPaths;
				}
			}

			// close the http server if it was internally created
			try {
				if (typeof this._closeServer !== 'undefined') {
					this._closeServer();
				}
			}
			finally {
				delete this._server;
			}

			if(callback)
				callback(error);
			else if(error)
				throw error;
		}
	}
}

module.exports = LiveReload