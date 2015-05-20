let http = require("http");

// Server
let Server = function() {
	// favIcon
	this.favIconData = null;

	// Routing
	this.routes = new Map();
	this.raw = new Map();

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

		let page = url.substring(1, i);
		let route = this.routes.get(page);

		// 404
		if(!route) {
			if(page === "_") {
				// 3 characters prefix: /_/
				i = url.indexOf("/", 3);

				if(i === -1)
					i = url.length;

				page = url.substring(3, i);
				route = this.raw.get(page);
			}

			if(!route) {
				response.writeHead(404);
				response.end();
				return;
			}
		}

		// Page parameters
		if(i >= url.length - 1)
			request.params = [];
		else
			request.params = url.substr(i + 1).split("/");

		// Execute handler
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