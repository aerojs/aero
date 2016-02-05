let http = require('http')

http.ServerResponse.prototype.json = function(data) {
	if(!this.headersSent) {
		this.writeHead(200, {
			'Content-Type': 'application/json; charset=UTF-8'
		})
	}

	this.end(typeof data === 'string' ? data : JSON.stringify(data))
}