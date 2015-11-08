'use strict'

// Modules
let fs = require('fs')
let path = require('path')
let zlib = require('zlib')
let etag = require('etag')
let chalk = require('chalk')
let proc = require('process')
let mkdir = require('mkdirp')
let watch = require('node-watch')
let Promise = require('bluebird')
let requester = require('request')
let exec = require('child_process').exec

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
exec = Promise.promisify(exec)

// Default config
let defaultConfig = require('../../default/config')

// Singleton
let aero = null

// Aero
class Aero {
	constructor() {
		aero = this
		aero.verbose = true
		aero.userEvents = []

		aero.run = Promise.coroutine(function*() {
			require.cache.length = 0

			aero.pages = new Map()
			aero.server = new Server()
			aero.static = new Static()
			aero.pluginScripts = []
			aero.pluginStyles = []
			aero.updating = false
			aero.serverStarted = false
			aero.version = require('../../package.json').version
			aero.production = proc.env.NODE_ENV === 'production'
			aero.liveReload = undefined

			// Register user events
			aero.events = new EventEmitter()
			aero.userEvents.forEach(function(registration) {
				aero.events.on(registration.eventName, registration.func)
			})

			let config = yield getFile('config.json', defaultConfig).then(JSON.parse)

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
		aero.userEvents.push({
			eventName,
			func
		})

		if(aero.events) {
			aero.events.on(eventName, func)
		}
	}

	stop() {
		return Promise.all([
			aero.server ? aero.server.stop() : Promise.resolve(),
			aero.liveReload ? aero.liveReload.stop() : Promise.resolve()
		])
	}

	restart() {
		return aero.stop().then(() => aero.run())
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
		watch('./config.json', filePath => aero.events.emit('config modified'))

		// GitHub service hook
		aero.server.routes.POST['git/pull'] = function(request, response) {
			if(aero.updating)
				return

			aero.updating = true
			console.log('Updating...')

			exec('git pull').then(function(stdout) {
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

		if(path.sep !== '/')
			pageId = pageId.replace(path.sep, '/')

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
					let homeJSON = path.join(homePath, 'home.json')

					mkdir(homePath)
						.then(() => fs.writeFileAsync(homeTemplate, 'h1 Hello Aero\np Edit this page in ' + homeTemplate, 'utf8'))
						.then(() => fs.writeFileAsync(homeJSON, JSON.stringify({url: ''}, null, '\t'), 'utf8'))
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

			// Figure out which plugins need to be installed
			let uninstalledPlugins =
				Object.keys(aero.config.plugins)
				.map(plugin => 'aero-' + plugin)
				.filter(function(plugin) {
					try{
						require.resolve(plugin)
						return false
					} catch(e) {
						return true
					}
				})

			// Need to install some plugins?
			if(uninstalledPlugins.length > 0) {
				let npmCommand = 'npm install ' + uninstalledPlugins.join(' ')
				console.log(chalk.bold('Executing:'), npmCommand)
				yield exec(npmCommand).then(console.log)
			}

			// Load plugins
			yield Promise.each(Object.keys(aero.config.plugins), function(pluginName) {
				if(aero.verbose)
					console.log('Loading plugin:', chalk.yellow(pluginName))

				let fullPluginName = `aero-${pluginName}`
				let plugin = require(fullPluginName)

				let tasks = []

				if(plugin.scripts) {
					tasks.push(
						Promise.all(plugin.scripts.map(function(scriptName) {
							let scriptPath = require.resolve(`${fullPluginName}/${scriptName}`)
							return loadScript(scriptPath)
						})).each(function(script) {
							aero.pluginScripts.push(script)
						})
					)
				}

				if(plugin.styles) {
					tasks.push(
						Promise.all(
							plugin.styles
							.map(styleName => loadStyle(require.resolve(`${fullPluginName}/${styleName}.styl`)))
						).each(style => aero.pluginStyles.push(style))
					)
				}

				if(plugin.init) {
					tasks.push(
						plugin.init(aero.config.plugins[pluginName])
					)
				}

				return Promise.all(tasks)
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

			// Get render function
			let getPageRenderFunction = function(page, request, response) {
				return function(params) {
					response.end(page.wrap(page.template(Object.assign({}, request.globals, params))))
				}
			}

			// Register a raw route
			if(page.controller) {
				if(page.controller.get) {
					let getPage = page.controller.get.bind(page.controller)

					if(page.template) {
						aero.server.raw[page.url] = function(request, response) {
							response.render = getPageRenderFunction(page, request, response)
							aero.server.execute(getPage, request, response)
						}
					} else {
						aero.server.raw[page.url] = function(request, response) {
							aero.server.execute(getPage, request, response)
						}
					}
				}
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
				'Vary': 'Accept-Encoding',
				'Server': 'Aero/' + aero.version
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
			if(page.controller) {
				// This will be an array that consists of request methods that have been implemented by the controller.
				// e.g. ['get', 'post'] or in most cases just ['get']
				let methodNames = Object.getOwnPropertyNames(page.controller).filter(function(property) {
					return (typeof page.controller[property]) === 'function'
				})

				if(page.template) {
					let renderPageTemplate = page.template

					if(aero.layout.controller) {
						// -----------------------------
						// Dynamic layout + Dynamic page
						// -----------------------------
						let renderLayout = aero.layout.controller.render.bind(aero.layout.controller)
						let layoutData = aero.layout.json
						let siteName = aero.config.siteName

						methodNames.forEach(function(method) {
							let next = page.controller[method].bind(page.controller)

							aero[method](page.url, function(request, response) {
								renderLayout(request, function(layoutControllerParams) {
									response.render = function(params) {
										let code = page.wrap(renderPageTemplate(Object.assign({}, request.globals, params)))

										if(layoutControllerParams) {
											if(layoutData || request.globals)
												Object.assign(layoutControllerParams, request.globals, layoutData)

											layoutControllerParams.content = code
											layoutControllerParams.css = css
											layoutControllerParams.js = js
											layoutControllerParams.siteName = siteName

											respond(renderLayoutTemplate(layoutControllerParams), response)
										} else {
											respond(renderLayoutTemplate(Object.assign(
												{
													content: code,
													css: css,
													js: js,
													siteName: siteName
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
						let layoutData = aero.layout.json

						methodNames.forEach(function(method) {
							let runPageController = page.controller[method].bind(page.controller)
							let siteName = aero.config.siteName

							aero[method](page.url, function(request, response) {
								response.render = function(params) {
									let code = page.wrap(renderPageTemplate(params))

									let layoutParams = {
										content: code,
										css: css,
										js: js,
										siteName: siteName
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
					methodNames.forEach(function(method) {
						aero[method](page.url, page.controller[method].bind(page.controller))
					})
				}
			} else {
				// Static page
				if(aero.layout.controller) {
					// ----------------------------
					// Dynamic layout + Static page
					// ----------------------------
					// No page controller, therefore we will only register 'get' methods.

					// Render layout method
					let renderLayout = aero.layout.controller.render.bind(aero.layout.controller)
					let layoutData = aero.layout.json
					let siteName = aero.config.siteName

					aero.get(page.url, function(request, response) {
						renderLayout(request, function(layoutControllerParams) {
							if(layoutData || request.globals)
								Object.assign(layoutControllerParams, request.globals, layoutData)

							layoutControllerParams.content = page.code
							layoutControllerParams.js = js
							layoutControllerParams.css = css
							layoutControllerParams.siteName = siteName

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
						css: css,
						js: js,
						siteName: aero.config.siteName
					}

					Object.assign(layoutParams, aero.layout.json)

					// Compile the static code
					let staticPageCode = renderLayoutTemplate(layoutParams)

					// To gzip, or not to gzip, that is the question
					if(staticPageCode.length >= gzipThreshold) {
						// Enable gzip
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
						// Disable gzip because the response is so small that it's not worth it.
						// Keep in mind that the client needs to uncompress and that takes time as well.
						// Therefore we send an uncompressed version.
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
			if(aero.verbose) {
				let msg = 'Restarting Aero because config.json has been modified'
				let separator = '-'.repeat(msg.length)

				console.log(chalk.bold(separator))
				console.log(chalk.bold(msg))
				console.log(chalk.bold(separator))
			}

			aero.restart()
		})
	}
}

module.exports = Aero