let http = require('http')

http.ServerResponse.prototype.redirect = function(url) {
	this.writeHead(301, {
		'Location': url
	})
	this.end()
}