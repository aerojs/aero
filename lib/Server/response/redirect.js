let http = require('http')

http.ServerResponse.prototype.redirect = function(url) {
	this.writeHead(302, {
		'Location': url
	})
	this.end()
}