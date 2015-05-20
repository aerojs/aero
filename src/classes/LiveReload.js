// Modules
let WebSocketServer = require("ws").Server;

// LiveReload
let LiveReload = function(port) {
	this.server = new WebSocketServer({
		port: port
	});

	this.server.broadcast = function(data) {
		//console.log("Broadcasting '" + data + "' to " + this.server.clients.length + " clients");
		this.server.clients.forEach(function(client) {
			client.send(data);
		});
	}.bind(this);

	this.script = "var ws = new WebSocket('ws://localhost:" + port + "/');ws.onmessage = function(){location.reload();};";
};

module.exports = LiveReload;