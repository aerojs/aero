class Server {
	constructor() {
		this.favIconData = null;
		this.routes = {};
		this.raw = {};
	}

	run(port, security, callBack) {
		if(security && security.key && security.cert)
			this.httpServer = require("http2").createServer(security, this.handleRequest.bind(this));
		else
			this.httpServer = require("http").createServer(this.handleRequest.bind(this));

		this.httpServer.listen(port, callBack);
	}

	close() {
		this.httpServer.close();
	}

	handleRequest(request, response) {
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
		let route = this.routes[page];

		// 404
		if(!route) {
			if(page === "_") {
				// 3 characters prefix: /_/
				i = url.indexOf("/", 3);

				if(i === -1)
					i = url.length;

				page = url.substring(3, i);
				route = this.raw[page];
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
	}
}

module.exports = Server;