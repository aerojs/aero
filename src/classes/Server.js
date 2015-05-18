let http = require("http");

// Server
let Server = function() {
	// httpServer
	this.httpServer = http.createServer(function(request, response) {
		response.end("Hello World");
	});
	
	// run
	this.run = function(port, callBack) {
		this.httpServer.listen(port, callBack);
	};
};

module.exports = Server;