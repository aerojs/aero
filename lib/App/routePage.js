let etag = require('etag')
let zlib = require('zlib')

module.exports = function(page) {
	// Register page
	this.pages.set(page.id, page)

	// Get render function
	let getPageRenderFunction = (page, request, response) => {
		return params => {
			response.end(page.wrap(page.template(Object.assign(
				{
					app: this
				},
				request.globals,
				page.json,
				params
			))))
		}
	}

	// Register a raw route
	if(page.controller) {
		page.httpVerbs.forEach(method => {
			let controllerMethod = page.controller[method].bind(page.controller)

			if(page.template) {
				this.server.raw[method.toUpperCase()][page.url] = (request, response) => {
					response.render = getPageRenderFunction(page, request, response)
					this.server.execute(controllerMethod, request, response)
				}
			} else {
				this.server.raw[method.toUpperCase()][page.url] = (request, response) => {
					this.server.execute(controllerMethod, request, response)
				}
			}
		})
	} else {
		this.server.raw.GET[page.url] = (request, response) => {
			response.end(page.code)
		}
	}

	// This should be close to the MTU size of a TCP packet.
	// Regarding performance it makes no sense to compress smaller files.
	// Bandwidth can be saved however the savings are minimal for small files
	// and the overhead of compressing can lead up to a 75% reduction
	// in server speed under high load. Therefore in this case
	// we're trying to optimize for performance, not bandwidth.
	const gzipThreshold = 1450

	let css = this.pluginStyles.join(' ') + this.css.map(style => style.code).join(' ')
	let js = '"use strict";' + (this.liveReload ? this.liveReload.script : '') + this.pluginScripts.join(';') + this.js.map(script => script.code).join(';')

	let mobileMetaTag = '<meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, user-scalable=yes">'
	let manifestTag = '<link rel="manifest" href="manifest.json">'

	if(this.layout.css)
		css += this.layout.css

	if(this.fontsCSS)
		css = this.fontsCSS + css

	let renderLayoutTemplate = params => {
		// Hacky, but works for now™
		return this.layout.template(params)
		.replace('</head><body', `${mobileMetaTag}${manifestTag}<style>${css}</style></head><body`)
		.replace('</body></html>', `<script>${js}</script></body></html>`)
	}

	let headers = {
		'Content-Type': 'text/html;charset=utf-8',
		'Vary': 'Accept-Encoding',
		'Server': 'Aero'
	}

	let bestCompressionOptions = {
		level: zlib.Z_BEST_COMPRESSION
	}

	let fastCompressionOptions = {
		level: zlib.Z_DEFAULT_COMPRESSION
	}

	let respond = (finalCode, response) => {
		if(finalCode.length >= gzipThreshold) {
			headers['Content-Encoding'] = 'gzip'

			// TODO: Can this be optimized? We might leave the function definition outside of 'respond'
			zlib.gzip(finalCode, fastCompressionOptions, function(error, gzippedCode) {
				headers['Content-Length'] = gzippedCode.length

				response.writeHead(200, headers)
				response.end(gzippedCode)
			})
		} else {
			headers['Content-Length'] = Buffer.byteLength(finalCode, 'utf8')

			response.writeHead(200, headers)
			response.end(finalCode)
		}
	}

	// Routing
	if(page.controller) {
		if(page.template) {
			let renderPageTemplate = page.template

			if(this.layout.controller) {
				// -----------------------------
				// Dynamic layout + Dynamic page
				// -----------------------------
				let renderLayout = this.layout.controller.render.bind(this.layout.controller)
				let layoutData = this.layout.json

				page.httpVerbs.forEach(method => {
					let next = page.controller[method].bind(page.controller)

					this[method](page.url, (request, response) => {
						renderLayout(request, layoutControllerParams => {
							response.render = params => {
								let code = page.wrap(renderPageTemplate(Object.assign({}, request.globals, page.json, params, page.defaultParams)))

								if(layoutControllerParams) {
									if(layoutData || request.globals)
										Object.assign(layoutControllerParams, request.globals, layoutData)

									layoutControllerParams.content = code
									layoutControllerParams.app = this
									layoutControllerParams.page = page

									respond(renderLayoutTemplate(layoutControllerParams), response)
								} else {
									respond(renderLayoutTemplate(Object.assign({
											content: code,
											app: this,
											page
										},
										request.globals,
										layoutData
									)), response)
								}
							}

							next(request, response)
						})
					})
				})
			} else {
				// ----------------------------
				// Static layout + Dynamic page
				// ----------------------------
				let layoutData = this.layout.json

				page.httpVerbs.forEach(method => {
					let runPageController = page.controller[method].bind(page.controller)

					this[method](page.url, (request, response) => {
						response.render = params => {
							let code = page.wrap(renderPageTemplate(Object.assign({}, request.globals, page.json, params, page.defaultParams)))

							let layoutParams = {
								content: code,
								app: this,
								page
							}

							if(layoutData || request.globals)
								Object.assign(layoutParams, request.globals, layoutData)

							respond(renderLayoutTemplate(layoutParams), response)
						}

						runPageController(request, response)
					})
				})
			}
		} else {
			// Completely user-controlled dynamic page (e.g. API calls)
			page.httpVerbs.forEach(method => {
				this[method](page.url, page.controller[method].bind(page.controller))
			})
		}
	} else {
		// Static page
		if(this.layout.controller) {
			// ----------------------------
			// Dynamic layout + Static page
			// ----------------------------
			// No page controller, therefore we will only register 'get' methods.

			// Render layout method
			let renderLayout = this.layout.controller.render.bind(this.layout.controller)
			let layoutData = this.layout.json

			this.get(page.url, (request, response) => {
				renderLayout(request, layoutControllerParams => {
					if(layoutData || request.globals)
						Object.assign(layoutControllerParams, request.globals, layoutData)

					layoutControllerParams.content = page.code
					layoutControllerParams.app = this
					layoutControllerParams.page = page

					respond(renderLayoutTemplate(layoutControllerParams), response)
				})
			})
		} else {
			// ---------------------------
			// Static layout + Static page
			// ---------------------------
			// No page controller, therefore we will only register 'get' methods.

			// Prepare the parameters for the layout
			let layoutParams = {
				content: page.code,
				app: this,
				page
			}

			Object.assign(layoutParams, this.layout.json)

			// Compile the static code
			let staticPageCode = renderLayoutTemplate(layoutParams)

			// To gzip, or not to gzip, that is the question
			if(staticPageCode.length >= gzipThreshold) {
				// Enable gzip
				headers['Content-Encoding'] = 'gzip'

				zlib.gzip(staticPageCode, bestCompressionOptions, (error, gzippedCode) => {
					headers['Content-Length'] = gzippedCode.length
					headers.ETag = etag(gzippedCode)

					this.get(page.url, function(request, response) {
						response.writeHead(200, headers)
						response.end(gzippedCode)
					})
				})
			} else {
				// Disable gzip because the response is so small that it's not worth it.
				// Keep in mind that the client needs to uncompress and that takes time as well.
				// Therefore we send an uncompressed version.
				headers['Content-Length'] = Buffer.byteLength(staticPageCode, 'utf8')
				headers.ETag = etag(staticPageCode)

				this.get(page.url, (request, response) => {
					response.writeHead(200, headers)
					response.end(staticPageCode)
				})
			}
		}
	}
}