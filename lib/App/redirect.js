module.exports = function(route, newHost) {
	this.get(route, function(request, response) {
		response.redirect(newHost)
	})
}