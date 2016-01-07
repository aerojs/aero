'use strict'

let aero = require('../')
let chalk = require('chalk')
let Promise = require('bluebird')
let http = require('http')
let querystring = require('querystring')

const emptyArray = []

// redirect('/destination')
http.ServerResponse.prototype.redirect = function(url) {
	this.writeHead(302, {
		'Location': url
	})
	this.end()
}

// json({data: 'test'})
http.ServerResponse.prototype.json = function(data) {
	if(!this.headersSent) {
		this.writeHead(200, {
			'Content-Type': 'application/json; charset=UTF-8'
		})
	}

	this.end(JSON.stringify(data))
}

class Server {
	constructor() {
		this.favIconData = null
		this.regexRoutes = {
			GET: new Set(),
			POST: new Set()
		}
		this.routes = {
			GET: {
				'favicon.ico': (request, response) => {
					this.sendFavIcon(response)
				},

				'robots.txt': (request, response) => {
					response.writeHead(200)
					response.end('User-agent: *\nDisallow: /_/\nAllow: /')
				}
			},
			POST: {}
		}
		this.raw = {
			GET: {},
			POST: {}
		}
		this.modifiers = []
		this.http = null
		this.protocol = ''
		this.port = undefined
		this.preRoute = undefined
	}

	run(httpPort, httpsPort, security, callBack) {
		if(security && security.key && security.cert) {
			this.protocol = 'https'
			this.port = httpsPort

			let options = {
				spdy: {
					protocols: ['h2'],
					plain: false
				}
			}

			Object.assign(options, security)

			this.http = require('spdy')
			this.httpServer = this.http.createServer(options, this.onRequest.bind(this))

			// Set up a permanent redirection to HTTPS
			http.createServer(function(request, response) {
			    response.writeHead(301, {
					'Location': 'https://' + request.headers['host'].replace(':' + httpPort, ':' + httpsPort) + request.url
				})
			    response.end()
			}).listen(httpPort, '::')
		} else {
			this.protocol = 'http'
			this.port = httpPort
			this.http = http
			this.httpServer = this.http.createServer(this.onRequest.bind(this))
		}

		this.httpServer.listen(this.port, '::', callBack)
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
		try {
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
		} catch(error) {
			console.error(chalk.bold(request.method, request.url))
			console.error(chalk.red(error))

			response.writeHead(500)
			response.end(error.toString())
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

	onRequest(request, response) {
		if(this.preRoute) {
			if(this.preRoute(request, response))
				return
		}

		// node-http2 doesn't define request.connection
		if(request.connection)
			request.connection.setNoDelay(true)

		let url = request.url

		// Remove traditional parameters: ?x=42
		url = this.removeParameters(url, request)

		// Always ignore trailing slashes
		if(url.endsWith('/'))
			url = url.slice(0, -1)

		let routes = undefined

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

	lastNext(request, response, error) {
		console.log(request.query)
		console.log(error)
		response.end(error)
	}
}

module.exports = Server