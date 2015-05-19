let http = require("http");

// Server
let Server = function() {
	// favIcon
	this.favIconData = null;
	
	// routes
	this.routes = new Map();
	
	// handleRequest
	this.handleRequest = function(request, response) {
		let url = request.url;
		
		// Favicon
		if(url === "/favicon.ico") {
			// 404
			if(!this.favIconData) {
				response.writeHead(404);
				response.end();
				return;
			}
			
			// Send image data
			response.writeHead(200, {
				"Content-Type": "image/x-icon"
			});
			response.end(this.favIconData);
			
			return;
		}
		
		// Determine which page has been requested
		let i = url.indexOf("/", 1);
		
		if(i === -1)
			i = url.length;
		
		let page = url.substr(1, i - 1);
		let route = this.routes.get(page);
		
		if(!route) {
			response.writeHead(404);
			response.end();
			return;
		}
		
		if(i >= url.length - 1)
			request.params = null;
		else
			request.params = url.substr(i + 1).split("/");
		
		route(request, response);
	}.bind(this);
	
	// httpServer
	this.httpServer = http.createServer(this.handleRequest);
	
	// run
	this.run = function(port, callBack) {
		this.httpServer.listen(port, callBack);
	};
};

module.exports = Server;