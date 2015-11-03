'use strict'

// Modules
let fs = require('fs')
let path = require('path')
let zlib = require('zlib')
let etag = require('etag')
let hjson = require('hjson')
let chalk = require('chalk')
let proc = require('process')
let mkdir = require('mkdirp')
let watch = require('node-watch')
let Promise = require('bluebird')
let requester = require('request')

// Functions
let getFile = require('../functions/getFile')
let download = require('../functions/download')
let loadStyle = require('../functions/loadStyle')
let loadScript = require('../functions/loadScript')
let loadFavIcon = require('../functions/loadFavIcon')
let launchServer = require('../functions/launchServer')
let watchFlatDirectory = require('../functions/watchFlatDirectory')

// Classes
let Page = require('./Page')
let Static = require('./Static')
let Layout = require('./Layout')
let Server = require('./Server')
let LiveReload = require('./LiveReload')
let EventEmitter = require('./EventEmitter')

// Promisify
Promise.promisifyAll(fs)
Promise.promisifyAll(requester)
mkdir = Promise.promisify(mkdir)

// Default config
let defaultConfig = require('../../default/config')

// Singleton
let aero = null

// Aero
class Aero {
	constructor() {
		aero = this
		aero.events = new EventEmitter()
		aero.pages = new Map()
		aero.server = new Server()
		aero.static = new Static()
		aero.pluginScripts = []
		aero.pluginStyles = []
		aero.updating = false
		aero.verbose = true
		aero.production = proc.env.NODE_ENV === 'production'
		aero.liveReload = undefined

		aero.run = Promise.coroutine(function*() {
			let config = yield getFile('config.hjson', defaultConfig).then(hjson.parse)

			// Set config to the data in the 'aero' field
			aero.config = Object.assign(defaultConfig, config)

			// Register event listeners
			aero.registerEventListeners()

			// Let the world know that we're ready
			aero.events.emit('config loaded', aero)
		})
	}

	get(url, func) {
		aero.route('GET', url, func)
	}

	post(url, func) {
		aero.route('POST', url, func)
	}

	route(method, url, func) {
		// RegEx
		if(url instanceof RegExp) {
			aero.server.regexRoutes[method].add({
				regEx: url,
				route: func
			})
			return
		}

		// Remove starting slash
		if(url.startsWith('/'))
			url = url.substr(1)

		// Remove ending slash
		if(url.endsWith('/'))
			url = url.slice(0, -1)

		// Save route
		aero.server.routes[method][url] = func
		aero.events.emit('route modified', method, url)
	}

	use() {
		for(let i = 0; i < arguments.length; i++) {
			aero.server.modifiers.push(arguments[i])
		}
	}

	on(eventName, func) {
		aero.events.on(eventName, func)
	}

	stop() {
		let webServerStop = aero.server ? aero.server.stop() : Promise.resolve()
		let liveReloadStop = (aero.liveReload && aero.liveReload.server) ? aero.liveReload.stop() : Promise.resolve()

		return Promise.all([
			webServerStop,
			liveReloadStop
		])
	}

	watchFiles() {
		// Watch for layout modifications
		watch(aero.config.path.layout, function() {
			aero.events.emit('layout modified')
		})

		// Watch for page modifications
		watch(aero.config.path.pages, function(filePath) {
			let pageId = path.dirname(path.relative(aero.config.path.pages, filePath))
			aero.events.emit('page modified', pageId)
		})

		// Watch for style modifications
		watchFlatDirectory(aero.config.path.styles, '.styl', aero.events, 'style modified')

		// Watch for script modifications
		watchFlatDirectory(aero.config.path.scripts, '.js', aero.events, 'script modified')

		// Watch for config modifications
		watch('./config.hjson', filePath => aero.events.emit('config modified'))

		// GitHub service hook
		aero.server.routes.POST['git/pull'] = function(request, response) {
			if(aero.updating)
				return

			aero.updating = true
			console.log('Updating...')

			let exec = require('child_process').exec
			exec('git pull', function(error, stdout, stderr) {
				aero.updating = false

				console.log(stdout)

				if(error) {
					response.writeHead(500)
					response.end(stdout)
					return
				}

				response.writeHead(200)
				response.end(stdout)
			})
		}
	}

	loadPage(pageId) {
		let pagePath = path.join(aero.config.path.pages, pageId)

		if(aero.verbose)
			console.log(`Loading page:`, chalk.blue(pageId))

		return new Page(pageId, pagePath, function(page) {
			// Ignore empty directories
			if(!page.controller && !page.template)
				return

			aero.events.emit('page loaded', page)
		})
	}

	registerEventListeners() {
		// Load all styles
		let recompileStyles = function() {
			let asyncStyleCompileTasks = aero.config.styles.map(function(styleId) {
				if(aero.verbose)
					console.log('Loading style:', chalk.magenta(styleId))

				let stylePath = path.join(aero.config.path.styles, styleId + '.styl')
				return loadStyle(stylePath)
			})

			return Promise.all(asyncStyleCompileTasks).then(function(results) {
				aero.css = results
				aero.events.emit('styles loaded')
			})
		}

		// Load all scripts
		let recompileScripts = function() {
			let asyncScriptCompileTasks = aero.config.scripts.map(function(scriptId) {
				if(aero.verbose)
					console.log('Loading script:', chalk.cyan(scriptId))

				return loadScript(path.join(aero.config.path.scripts, scriptId + '.js'))
			})

			return Promise.all(asyncScriptCompileTasks).then(function(results) {
				aero.js = results
				aero.events.emit('scripts loaded')
			})
		}

		let findPages = Promise.coroutine(function*(rootPath) {
			let dirs =
				fs.readdirAsync(rootPath)
				.map(file => path.join(rootPath, file))
				.filter(file => fs.statSync(file).isDirectory())

			let subs =
				dirs.map(dir => findPages(dir))

			return (yield dirs).concat(yield subs).reduce((a, b) => a.concat(b), [])
		})

		// Reload pages
		let reloadPages = function() {
			findPages(aero.config.path.pages)
			.map(pagePath => path.relative(aero.config.path.pages, pagePath))
			.map(aero.loadPage)
			.then(function() {
				// Create default home page if there is no page configured yet
				if(aero.pages.size === 0) {
					let homePath = path.join(aero.config.path.pages, 'home')
					let homeTemplate = path.join(homePath, 'home.jade')
					let homeJSON = path.join(homePath, 'home.hjson')

					mkdir(homePath)
						.then(() => fs.writeFileAsync(homeTemplate, 'h1 Hello Aero\np Edit this page in ' + homeTemplate, 'utf8'))
						.then(() => fs.writeFileAsync(homeJSON, hjson.stringify({url: ''}, {space: '\t'}) + '\n', 'utf8'))
						.then(() => aero.loadPage('home'))
						.then(function() {
							aero.watchFiles()
						})
				} else {
					aero.watchFiles()
				}
			})

		}

		// Aero config loaded
		aero.events.on('config loaded', Promise.coroutine(function*() {
			// Favicon
			loadFavIcon(aero.config.favIcon, function(imageData) {
				aero.server.favIconData = imageData
			})

			// Create directories
			yield Promise.all(Object.keys(aero.config.path).map(directory => mkdir(directory)))

			// Load plugins
			yield Promise.each(Object.keys(aero.config.plugins), function(pluginName) {
				if(aero.verbose)
					console.log('Loading plugin:', chalk.yellow(pluginName))

				let plugin = require('../../plugins/' + pluginName)

				if(plugin.scripts) {
					return Promise.all(plugin.scripts.map(function(scriptName) {
						let scriptPath = require.resolve(`../../plugins/${pluginName}/${scriptName}`)
						return loadScript(scriptPath)
					})).each(function(script) {
						aero.pluginScripts.push(script)
					})
				}

				if(plugin.styles) {
					return Promise.all(
						plugin.styles
						.map(styleName => loadStyle(require.resolve(`../../plugins/${pluginName}/${styleName}.styl`)))
					).each(style => aero.pluginStyles.push(style))
				}

				if(plugin.init)
					return plugin.init(aero.config.plugins[pluginName])

				return Promise.resolve()
			})

			// Security
			if(aero.config.security && aero.config.security.key && aero.config.security.cert) {
				aero.security = yield Promise.props({
					key: getFile(path.join(aero.config.path.security, aero.config.security.key), '', 'ascii', false),
					cert: getFile(path.join(aero.config.path.security, aero.config.security.cert), '', 'ascii', false)
				})

				if(!aero.security.key)
					console.error(chalk.red(`Failed to load security key: ${aero.config.security.key}`))

				if(!aero.security.cert)
					console.error(chalk.red(`Failed to load security certificate: ${aero.config.security.cert}`))
			}

			// Live reload
			if(!aero.production)
				aero.liveReload = new LiveReload(aero.security, aero.config.liveReloadPort)

			// Download fonts definitions
			if(aero.config.fonts.length > 0) {
				if(aero.verbose)
					console.log('Loading fonts:', chalk.bold(aero.config.fonts.join(', ')));

				aero.fontDefinitions = yield download('https://fonts.googleapis.com/css?family=' + aero.config.fonts.join('|'))
			}

			// Layout
			aero.layout = yield new Layout(aero.config.path.layout, function(layout) {
				aero.events.emit('layout loaded', layout)
				recompileStyles().then(recompileScripts).then(reloadPages)
			})

			// Static files
			aero.config.static.forEach(aero.static.add)

			// Launch the server
			launchServer(aero)
		}))

		// Layout modifications
		aero.events.on('layout modified', Promise.coroutine(function*() {
			aero.layout = yield new Layout(aero.config.path.layout)
			aero.events.emit('layout loaded')
			reloadPages()
		}))

		// Recompile styles when modified
		aero.events.on('style modified', function() {
			recompileStyles().then(reloadPages)
		})

		// Recompile scripts when modified
		aero.events.on('script modified', function() {
			recompileScripts().then(reloadPages)
		})

		// Page modifications
		aero.events.on('page modified', function(pageId) {
			aero.loadPage(pageId)
		})

		// Page loaded
		aero.events.on('page loaded', function(page) {
			// Register page
			aero.pages.set(page.id, page)

			// Register a raw route
			if(page.controller) {
				if(page.controller.get)
					aero.server.raw[page.url] = page.controller.get.bind(page.controller)
			} else {
				aero.server.raw[page.url] = function(request, response) {
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

			let css =  aero.pluginStyles.join(' ') + aero.css.join(' ')
			let js = (aero.liveReload ? aero.liveReload.script : '') + aero.pluginScripts.join(';') + aero.js.join(';') // '"use strict";' +
			let renderLayoutTemplate = aero.layout.template

			if(aero.layout.css)
				css += aero.layout.css

			if(aero.fontDefinitions)
				css = aero.fontDefinitions + css

			let headers = {
				'Content-Type': 'text/html;charset=utf-8',
				'Vary': 'Accept-Encoding'
			}

			let bestCompressionOptions = {
				level: zlib.Z_BEST_COMPRESSION
			}

			let fastCompressionOptions = {
				level: zlib.Z_DEFAULT_COMPRESSION
			}

			let respond = function(finalCode, response) {
				if(finalCode.length >= gzipThreshold) {
					headers['Content-Encoding'] = 'gzip'

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
			if(page.controller && page.controller.render) {
				let renderPageTemplate = page.template
				let renderPage = page.controller.render

				// Syntax error while compiling the template?
				// Then let's send over a live reload script until it's fixed
				if(!renderPageTemplate) {
					if(aero.liveReload) {
						aero.get(page.url, function(request, response) {
							response.end('<script>' + aero.liveReload.script + '</script>')
						})
					}
					return
				}

				if(aero.layout.controller) {
					let renderLayout = aero.layout.controller.render.bind(aero.layout.controller)

					// Dynamic layout + Dynamic page
					aero.get(page.url, function(request, response) {
						renderLayout(request, function(layoutControllerParams) {
							renderPage(request, function(params) {
								let code = renderPageTemplate(Object.assign({}, params, request.globals))

								if(layoutControllerParams) {
									if(aero.layout.json || request.globals)
										Object.assign(layoutControllerParams, request.globals, aero.layout.json)

									layoutControllerParams.content = code
									layoutControllerParams.css = css
									layoutControllerParams.js = js
									layoutControllerParams.siteName = aero.config.siteName

									respond(renderLayoutTemplate(layoutControllerParams), response)
								} else {
									respond(renderLayoutTemplate(Object.assign(
										{
											content: code,
											css: css,
											js: js,
											siteName: aero.config.siteName
										},
										request.globals,
										aero.layout.json
									)), response)
								}
							})
						})
					})
				} else {
					// Static layout + Dynamic page
					aero.get(page.url, function(request, response) {
						renderPage(request, function(params) {
							let layoutParams = {
								content: renderPageTemplate(params),
								css: css,
								js: js,
								siteName: aero.config.siteName
							}

							if(aero.layout.json || request.globals)
								Object.assign(layoutParams, request.globals, aero.layout.json)

							respond(renderLayoutTemplate(layoutParams), response)
						})
					})
				}
			} else {
				if(page.controller) {
					// Completely user-controlled dynamic page (e.g. API calls)
					if(page.controller.get)
						aero.get(page.url, page.controller.get.bind(page.controller))
					if(page.controller.post)
						aero.post(page.url, page.controller.post.bind(page.controller))
				} else if(aero.layout.controller) {
					let renderLayout = aero.layout.controller.render.bind(aero.layout.controller)

					// Dynamic layout + Static page
					aero.get(page.url, function(request, response) {
						renderLayout(request, function(layoutControllerParams) {
							if(aero.layout.json || request.globals)
								Object.assign(layoutControllerParams, request.globals, aero.layout.json)

							layoutControllerParams.content = page.code
							layoutControllerParams.js = js
							layoutControllerParams.css = css
							layoutControllerParams.siteName = aero.config.siteName

							respond(renderLayoutTemplate(layoutControllerParams), response)
						})
					})
				} else {
					// Static layout + Static page
					let layoutParams = {
						content: page.code,
						css: css,
						js: js,
						siteName: aero.config.siteName
					}

					if(aero.layout.json)
						Object.assign(layoutParams, aero.layout.json)

					let staticPageCode = renderLayoutTemplate(layoutParams)

					if(staticPageCode.length >= gzipThreshold) {
						headers['Content-Encoding'] = 'gzip'

						zlib.gzip(staticPageCode, bestCompressionOptions, function(error, gzippedCode) {
							headers['Content-Length'] = gzippedCode.length
							headers.ETag = etag(gzippedCode)

							aero.get(page.url, function(request, response) {
								response.writeHead(200, headers)
								response.end(gzippedCode)
							})
						})
					} else {
						headers['Content-Length'] = Buffer.byteLength(staticPageCode, 'utf8')
						headers.ETag = etag(staticPageCode)

						aero.get(page.url, function(request, response) {
							response.writeHead(200, headers)
							response.end(staticPageCode)
						})
					}
				}
			}
		})

		// Check page when it's available on the server
		aero.events.on('route modified', function(method, relativePath) {
			let url = `${aero.server.protocol}://localhost:${aero.config.port}/${relativePath}`;

			if(aero.serverStarted) {
				let startTime = new Date()

				requester[`${method.toLowerCase()}Async`]({uri: url, timeout: 2000, encoding: null}).then(function(response) {
					let responseTime = new Date() - startTime

					if(response.statusCode === 404) {
						console.error('Not found:', chalk.red(`${url}`))
						return Promise.resolve(404)
					}

					if(aero.verbose) {
						let formatTime = responseTime < 200 ? chalk.green : (responseTime < 1000 ? chalk.yellow : chalk.red)
						let formatSize = response.body.length < 50 * 1024 ? chalk.green : (response.body.length < 200 * 1024 ? chalk.yellow : chalk.red)

						method += ' '.repeat(5 - method.length)

						let ok = `${url}`
						ok += ' '.repeat(Math.max(52 - ok.length, 0))

						let size = `${(response.body.length / 1024).toFixed(1)}`
						size = ' '.repeat(Math.max(6 - size.length, 0)) + formatSize(size) + chalk.dim(' KB')

						let time = `${responseTime}`
						time = ' '.repeat(Math.max(6 - time.length, 0)) + formatTime(time) + chalk.dim(' ms')

						console.log(chalk.dim(method), chalk.blue(ok), size, time)
					}

					// let checkHTML5 = function(code) {
					// 	let html5Lint = require('html5-lint')
					// 	html5Lint(body, function(error, results) {
					// 		if(error) {
					// 			console.log(chalk.red(error))
					// 			return
					// 		}
					//
					// 		results.messages.forEach(function(msg) {
					// 			console.log('/' + relativePath, msg.type, chalk.red(msg.message))
					// 		});
					// 	})
					// }
					//
					// if(response.headers['content-encoding'] === 'gzip') {
					// 	zlib.gunzip(body, function(error, unzippedCode) {
					// 		checkHTML5(unzippedCode.toString())
					// 	})
					// } else {
					// 	checkHTML5(body)
					// }

					return Promise.resolve(response.statusCode)
				}).error(function(e) {
					console.error(chalk.red(`Error fetching ${url}`))
					return Promise.reject(e)
				})
			}

			// Live reload
			if(aero.liveReload)
				aero.liveReload.broadcast(relativePath)
		})

		// Config modifications
		aero.events.on('config modified', function() {
			aero.stop().then(aero.run)
		})
	}
}

module.exports = Aero