module.exports = function(url, request, response) {
	let match = null
	const routes = this.regexRoutes[request.method]

	// Bad request
	if(!routes) {
		response.writeHead(400)
		response.end()
	}

	for(let regexRoute of routes) {
		match = url.match(regexRoute.regEx)

		if(!match)
			continue

		// We skip the first parameter because it just includes the full URL
		request.params = match.splice(1)
		return regexRoute.route
	}
}