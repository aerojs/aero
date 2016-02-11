let querystring = require('querystring')

const emptyArray = []

module.exports = function(request, response) {
	if(this.rewrite) {
		if(this.rewrite(request, response))
			return
	}

	let url = request.url

	// Remove traditional parameters: ?x=42
	const paramsPosition = url.indexOf('?', 1)

	if(paramsPosition === -1) {
		url = url.substring(1)
	} else {
		request.query = querystring.parse(url.substring(paramsPosition + 1))
		url = url.substring(1, paramsPosition)
	}

	// Always ignore trailing slashes
	if(url.endsWith('/'))
		url = url.slice(0, -1)

	let routes = null

	if(url.startsWith('_')) {
		// Raw routes: Used by AJAX requests in Kaze
		routes = this.raw[request.method]
		url = url.substring(2)
	} else {
		// Standard routes
		routes = this.routes[request.method]
	}

	// Bad request: request.method is invalid
	if(!routes) {
		response.writeHead(400)
		return response.end()
	}

	// Determine which page has been requested
	let route = routes[url]

	if(route) {
		request.params = emptyArray
		return this.execute(route, request, response)
	}

	// Remove right part of the URL and try again
	let slashPosition = url.length

	while((slashPosition = url.lastIndexOf('/', slashPosition - 1)) !== -1) {
		let page = url.substring(0, slashPosition)
		route = routes[page]

		if(route) {
			request.params = url.substr(slashPosition + 1).split('/')
			return this.execute(route, request, response)
		}
	}

	// Search regex routes
	route = this.handleRegex(url, request, response)

	if(route)
		return this.execute(route, request, response)

	// Still not found? 404...
	response.writeHead(404)
	response.end()
}