module.exports = function(route, file) {
	this.get(route, function(request, response) {
		response.sendFile(file)
	})
}