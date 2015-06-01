// Modules
let WebSocketServer = require("ws").Server;

// LiveReload
let LiveReload = function(security, port) {
	let processRequest = function(req, res) {
		res.writeHead(200);
		res.end("Aero WebSockets!\n");
	};
	
	let app = null;
	let protocol = null;

	if(security && security.key && security.cert) {
		app = require("http2").createServer(security, processRequest);
		protocol = "wss";
	} else {
		app = require("http").createServer(processRequest);
		protocol = "ws";
	}
	
	// Script for each page in dev mode
	this.script = `var ws = new WebSocket('${protocol}://localhost:${port}/');ws.onmessage = function(){location.reload();};`;
	
	// Callback
	let ready = function(error) {
		if(error)
			throw error;
			
		this.server = new WebSocketServer({
			server: app
		});

		this.server.broadcast = function(data) {
			//console.log("Broadcasting '" + data + "' to " + this.server.clients.length + " clients");
			this.server.clients.forEach(function(client) {
				client.send(data);
			});
		}.bind(this);
	}.bind(this);
	
	// Listen
	app.listen(port, ready);
};

module.exports = LiveReload;