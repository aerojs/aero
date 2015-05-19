// Modules
let WebSocketServer = require("ws").Server;

// LiveReload
let LiveReload = function() {
    this.server = new WebSocketServer({
        port: 9000
    });
    
    this.server.broadcast = function(data) {
        //console.log("Broadcasting '" + data + "' to " + this.server.clients.length + " clients");
        this.server.clients.forEach(function(client) {
            client.send(data);
        });
    }.bind(this);
};

module.exports = LiveReload;