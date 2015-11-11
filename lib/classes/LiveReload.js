'use strict'

let aero = require('../')
let chalk = require('chalk')
let WebSocket = require('ws')
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
		this.script = `function startLiveReload(){var ws = new WebSocket('${protocol}://localhost:${port}/');ws.onmessage = function(e){if(e.data === location.pathname) location.reload();};ws.onclose = function(){console.log('LiveReload websocket closed');startLiveReload();};}; startLiveReload();`

		// Listen
		app.listen(port, function(error) {
			if(error)
				throw error

			// https://github.com/websockets/ws/pull/611
			this.fixWSSBug()

			this.server = new WebSocket.Server({
				server: app
			})
		}.bind(this))
	}

	broadcast(data) {
		if(!this.server || !this.server.clients || this.server.clients.length === 0)
			return

		data = '/' + data

		// Broadcast data to all clients
		let clientCount = this.server.clients.length
		console.log(`Refreshing ${chalk.blue(data)} on ${clientCount} client${clientCount === 1 ? '' : 's'}`)

		this.server.clients.forEach(function(client) {
			if(client.readyState !== WebSocket.OPEN)
				return

			try {
				client.send(data)
			} catch(error) {
				console.error(chalk.bold('LiveReload error: Sending data to a client...'))
				console.error(chalk.red(error))
			}
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
		WebSocket.Server.prototype.close = function(callback) {
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