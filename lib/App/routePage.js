const zlib = require('zlib')
const crypto = require('crypto')
const NodeCache = require('node-cache')

// This should be close to the MTU size of a TCP packet.
// Regarding performance it makes no sense to compress smaller files.
// Bandwidth can be saved however the savings are minimal for small files
// and the overhead of compressing can lead up to a 75% reduction
// in server speed under high load. Therefore in this case
// we're trying to optimize for performance, not bandwidth.
const gzipThreshold = 1450

// We cache the gzipped response using the ETag as a key
// for the in-memory cache. By default we save the cached
// responses only for 10 minutes to prevent using a lot of memory.
const gzipCache = new NodeCache({
	stdTTL: 600,
	checkperiod: 610
})

// GZip compression options
const bestCompressionOptions = {
	level: zlib.Z_BEST_COMPRESSION
}

const fastCompressionOptions = {
	level: zlib.Z_BEST_SPEED
}

// Boilerplate HTML content
const mobileMetaTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes">'
const manifestTag = '<link rel="manifest" href="/manifest.json">'
const scriptTag = '<script src="/scripts.js"></script>'

// Hash a UTF-8 string using SHA-1
function hash(code) {
	return crypto.createHash('sha1').update(code, 'utf8').digest('hex')
}

// Generic respond functionality
function respond(code, headers, request, response) {
	let etag = hash(code)

	if(request.headers['if-none-match'] === etag) {
		response.writeHead(304)
		response.end()
		return
	}

	// This is actually faster than response.setHeader(), believe it or not.
	let localHeaders = Object.assign({}, headers)

	// Force the browser to revalidate this resource
	localHeaders['Cache-Control'] = 'must-revalidate'

	// Cache key
	localHeaders.ETag = etag

	// Send response
	if(code.length >= gzipThreshold) {
		localHeaders['Content-Encoding'] = 'gzip'

		let gzippedCode = gzipCache.get(etag)

		if(gzippedCode !== undefined) {
			localHeaders['Content-Length'] = gzippedCode.length

			response.writeHead(response.statusCode || 200, localHeaders)
			response.end(gzippedCode)
			return
		}

		zlib.gzip(code, fastCompressionOptions, function(error, gzippedCode) {
			localHeaders['Content-Length'] = gzippedCode.length

			response.writeHead(response.statusCode || 200, localHeaders)
			response.end(gzippedCode)

			gzipCache.set(etag, gzippedCode)
		})
	} else {
		localHeaders['Content-Length'] = Buffer.byteLength(code, 'utf8') //codeBuffer.length

		response.writeHead(response.statusCode || 200, localHeaders)
		response.end(code)
	}
}

function respondStatic(code, baseHeaders) {
	const headers = Object.assign({}, baseHeaders)

	headers['Cache-Control'] = 'must-revalidate'

	// To gzip, or not to gzip, that is the question
	if(code.length >= gzipThreshold) {
		// Enable gzip
		headers['Content-Encoding'] = 'gzip'

		const gzippedCode = zlib.gzipSync(code, bestCompressionOptions)

		headers['Content-Length'] = gzippedCode.length
		headers.ETag = hash(gzippedCode)

		return function(request, response) {
			if(request.headers['if-none-match'] === headers.ETag) {
				response.writeHead(304)
				response.end()
				return
			}

			response.writeHead(200, headers)
			response.end(gzippedCode)
		}
	} else {
		// Disable gzip because the response is so small that it's not worth it.
		// Keep in mind that the client needs to uncompress and that takes time as well.
		// Therefore we send an uncompressed version.
		headers['Content-Length'] = Buffer.byteLength(code, 'utf8')
		headers.ETag = hash(code)

		return function(request, response) {
			if(request.headers['if-none-match'] === headers.ETag) {
				response.writeHead(304)
				response.end()
				return
			}

			response.writeHead(200, headers)
			response.end(code)
		}
	}
}

module.exports = function(page) {
	// Register page
	this.pages.set(page.id, page)

	// Headers for raw responses
	const rawHeaders = {
		'Content-Type': 'text/html;charset=utf-8'
	}

	// Get render function
	let getPageRenderFunction = (page, request, response) => {
		return params => {
			respond(page.wrap(page.template(Object.assign(
				{},
				page.defaultParams,
				request.globals,
				page.json,
				params
			))), rawHeaders, request, response)
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
				// Completely user controlled response
				this.server.raw[method.toUpperCase()][page.url] = (request, response) => {
					this.server.execute(controllerMethod, request, response)
				}
			}
		})
	} else {
		this.server.raw.GET[page.url] = respondStatic(page.code, rawHeaders)
	}

	// Headers
	const headers = Object.assign({
		'Content-Type': 'text/html;charset=utf-8',
		'Link': '</scripts.js>; rel=preload; as=script',
		'Vary': 'Accept-Encoding',
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
		// 'Content-Security-Policy': 'default-src https:; script-src https: \'unsafe-inline\' \'unsafe-eval\'; style-src https: \'unsafe-inline\'; connect-src https: wss:',
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'SAMEORIGIN',
		'X-XSS-Protection': '1; mode=block',
		'Server': 'Aero'
	}, this.config.headers)

	// Allow resource loading on self-signed certificates
	if(!this.security.key || !this.security.cert) {
		delete headers['Content-Security-Policy']
		delete headers['Strict-Transport-Security']
	}

	const styleTag = `<style>${this.combinedCSS}</style>`
	const headBodyReplacement = `${mobileMetaTag}${manifestTag}${styleTag}</head><body`
	const bodyHtmlReplacement = `${scriptTag}</body></html>`

	const renderLayoutTemplate = params => {
		// Hacky, but works for now™
		return this.layout.template(params)
		.replace('</head><body', headBodyReplacement)
		.replace('</body></html>', bodyHtmlReplacement)
	}

	// Display template error messages
	if(page.template && page.template.isError) {
		page.httpVerbs.forEach(method => {
			this[method](page.url, (request, response) => {
				response.writeHead(500)
				response.end(page.template())
			})
		})
		return
	}

	// So we can avoid the bind calls
	const app = this

	// Routing
	if(page.controller) {
		if(page.template) {
			const renderPageTemplate = page.template

			if(this.layout.controller) {
				// -----------------------------
				// Dynamic layout + Dynamic page
				// -----------------------------
				const renderLayout = this.layout.controller.render.bind(this.layout.controller)
				const layoutData = this.layout.json

				page.httpVerbs.forEach(method => {
					const next = page.controller[method].bind(page.controller)

					this[method](page.url, function requestHandler(request, response) {
						renderLayout(request, function handleLayout(layoutControllerParams) {
							response.render = function handlePage(params) {
								const content = page.wrap(renderPageTemplate(Object.assign({}, page.defaultParams, request.globals, page.json, params)))

								if(layoutControllerParams) {
									if(layoutData || request.globals)
										Object.assign(layoutControllerParams, request.globals, layoutData)

									layoutControllerParams.content = content
									layoutControllerParams.app = app
									layoutControllerParams.page = page

									respond(renderLayoutTemplate(layoutControllerParams), headers, request, response)
								} else {
									respond(renderLayoutTemplate(Object.assign({
											content,
											app,
											page
										},
										request.globals,
										layoutData
									)), headers, request, response)
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
				const layoutData = this.layout.json

				page.httpVerbs.forEach(method => {
					const runPageController = page.controller[method].bind(page.controller)

					this[method](page.url, function requestHandler(request, response) {
						response.render = function handlePage(params) {
							const content = page.wrap(renderPageTemplate(Object.assign({}, page.defaultParams, request.globals, page.json, params)))

							const layoutParams = {
								content,
								app,
								page
							}

							if(layoutData || request.globals)
								Object.assign(layoutParams, request.globals, layoutData)

							respond(renderLayoutTemplate(layoutParams), headers, request, response)
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
			const renderLayout = this.layout.controller.render.bind(this.layout.controller)
			const layoutData = this.layout.json

			this.get(page.url, function(request, response) {
				renderLayout(request, function(layoutControllerParams) {
					if(!layoutControllerParams)
						layoutControllerParams = {}

					if(layoutData || request.globals)
						Object.assign(layoutControllerParams, request.globals, layoutData)

					layoutControllerParams.content = page.code
					layoutControllerParams.app = app
					layoutControllerParams.page = page

					respond(renderLayoutTemplate(layoutControllerParams), headers, request, response)
				})
			})
		} else {
			// ---------------------------
			// Static layout + Static page
			// ---------------------------
			// No page controller, therefore we will only register 'get' methods.

			// Prepare the parameters for the layout
			const layoutParams = {
				content: page.code,
				app: this,
				page
			}

			Object.assign(layoutParams, this.layout.json)

			// Compile the static code
			const code = renderLayoutTemplate(layoutParams)

			// Respond in the most performant way (compressed vs. not compressed)
			this.get(page.url, respondStatic(code, headers))
		}
	}
}
