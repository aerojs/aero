let http = require('http')

http.ServerResponse.prototype.redirect = function(url, status) {
	this.writeHead(status || 302, {
		'Location': url
	})
	this.end()
}