module.exports = function(route, newHost) {
	this.get(route, function(request, response) {
		// We use 301 status code because app.redirect() calls are usually permanent
		response.redirect(newHost, 301)
	})
}