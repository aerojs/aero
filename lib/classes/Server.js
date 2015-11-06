'use strict'

let Promise = require('bluebird')
let querystring = require('querystring')

const emptyArray = []

class Server {
	constructor() {
		this.favIconData = null
		this.regexRoutes = {
			GET: new Set(),
			POST: new Set()
		}
		this.routes = {
			GET: {},
			POST: {}
		}
		this.raw = {}
		this.modifiers = []
		this.http = null
		this.protocol = ''
	}

	run(port, security, callBack) {
		if(security && security.key && security.cert) {
			this.protocol = 'https'
			this.http = require('http2')
			this.httpServer = this.http.createServer(security, this.handleRequest.bind(this))
		} else {
			this.protocol = 'http'
			this.http = require('http')
			this.httpServer = this.http.createServer(this.handleRequest.bind(this))
		}

		// Add redirect function
		this.http.ServerResponse.prototype.redirect = function(url) {
			this.writeHead(302, {
				'Location': url
			})
			this.end()
		}

		this.httpServer.listen(port, callBack)
	}

	stop() {
		if(!this.httpServer)
			return Promise.resolve()

		let closeAsync = Promise.promisify(this.httpServer.close, {context: this.httpServer})
		return closeAsync()
	}

	sendFavIcon(response) {
		// 404
		if(!this.favIconData) {
			response.writeHead(404)
			response.end()
			return
		}

		// Send image data
		response.writeHead(200, {
			'Content-Type': 'image/x-icon',
			'Cache-Control': 'max-age=864000'
		})
		response.end(this.favIconData)
	}

	removeParameters(url, request) {
		let paramsPosition = url.indexOf('?', 1)

		if(paramsPosition === -1) {
			return url.substring(1)
		} else {
			request.query = querystring.parse(url.substring(paramsPosition + 1))
			return url.substring(1, paramsPosition)
		}
	}

	execute(route, request, response) {
		// Execute handler
		if(this.modifiers.length === 0) {
			route(request, response, function() {
				console.log('next')
			})
		} else {
			let generateNext = function(index) {
				if(index === this.modifiers.length)
					return route.bind(undefined, request, response, this.lastNext.bind(this, request, response))

				return this.modifiers[index].bind(undefined, request, response, generateNext(index + 1))
			}.bind(this)

			generateNext(0)()
		}
	}

	handleRegex(url, request, response) {
		let match = null
		let routes = this.regexRoutes[request.method]

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

	handleRequest(request, response) {
		request.connection.setNoDelay(true)
		let url = request.url

		// Favicon
		if(url === '/favicon.ico') {
			this.sendFavIcon(response)
			return
		}

		// Remove traditional parameters: ?x=42
		url = this.removeParameters(url, request)

		// Always ignore trailing slashes
		if(url.endsWith('/'))
			url = url.slice(0, -1)

		let routes = null

		if(url.startsWith('_')) {
			routes = this.raw
			url = url.substring(2)
		} else {
			routes = this.routes[request.method]

			// Bad request
			if(!routes) {
				response.writeHead(400)
				response.end()
			}
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

	lastNext(request, response, error) {
		console.log(request.query)
		console.log(error);
		response.end(error);
	}
}

module.exports = Server