'use strict';

let WebSocketServer = require('ws').Server;

class LiveReload {
	constructor(security, port) {
		let app = null;
		let protocol = null;

		if(security && security.key && security.cert) {
			app = require('http2').createServer(security, this.processRequest);
			protocol = 'wss';
		} else {
			app = require('http').createServer(this.processRequest);
			protocol = 'ws';
		}

		// Script for each page in dev mode
		this.script = `var ws = new WebSocket('${protocol}://localhost:${port}/');ws.onmessage = function(){location.reload();};`;

		// Listen
		app.listen(port, function(error) {
			if(error)
				throw error;

			this.server = new WebSocketServer({
				server: app
			});
		}.bind(this));
	}

	broadcast(data) {
		if(!this.server)
			return;

		// Broadcast data to all clients
		this.server.clients.forEach(function(client) {
			client.send(data);
		});
	}

	processRequest(request, response) {
		response.writeHead(200);
		response.end('Aero WebSockets!\n');
	}
}

module.exports = LiveReload;