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
let deepAssign = require('deep-assign')
let html5Lint = Promise.promisify(require('html5-lint'))

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
Promise.promisifyAll(zlib)
Promise.promisifyAll(requester)
mkdir = Promise.promisify(mkdir)
exec = Promise.promisify(exec)

// New yield handler
Promise.coroutine.addYieldHandler(function(value) {
	if(Array.isArray(value))
		return Promise.all(value)

	if(typeof value === 'object')
		return Promise.props(value)
})

// Default config
let defaultConfig = require('../../default/config')
let defaultPackage = require('../../default/package')

// Aero
class Aero {
	constructor(root) {
		this.root = root || ''
		this.verbose = true
		this.overwriteLoadingMessages = false
		this.showStyleSize = true

		this.past = {
			events: [],
			middleware: [],
			routes: []
		}

		this.go = Promise.coroutine(function*() {
			require.cache.length = 0

			this.pages = new Map()
			this.server = new Server()
			this.static = new Static()
			this.pluginScripts = []
			this.pluginStyles = []
			this.pendingRouteChecks = []
			this.benchmarks = {}
			this.updating = false
			this.serverStarted = false
			this.version = require('../../package.json').version
			this.production = proc.env.NODE_ENV === 'production'
			this.liveReload = undefined

			// Register past events
			this.events = new EventEmitter()
			this.past.events.forEach(registration => {
				this.events.on(registration.eventName, registration.func)
			})

			// Register past middleware
			this.past.middleware.forEach(middleware => {
				this.server.modifiers.push(middleware)
			})

			// Register past routes
			this.past.routes.forEach(call => call())

			let setup = yield {
				config: getFile(path.join(this.root, 'config.json'), defaultConfig).then(JSON.parse),
				package: getFile(path.join(this.root, 'package.json'), defaultPackage).then(JSON.parse)
			}

			this.package = setup.package

			// Config is a mix of default and user configuration
			this.config = deepAssign(defaultConfig, setup.config)

			Object.keys(this.config.path).forEach(key => {
				this.config.path[key] = path.join(this.root, this.config.path[key])
			})

			// Register event listeners
			this.registerEventListeners()

			// Benchmark startup
			this.time('All')
			this.events.on('all pages loaded', () => {
				this.timeEnd('All')
				this.separator()

				// Log benchmark times
				if(this.verbose) {
					Object.keys(this.benchmarks)
						.forEach(phase => console.log(phase + ':', ' '.repeat(Math.max(14 - phase.length - this.benchmarks[phase].toString().length, 0)), this.benchmarks[phase] + chalk.dim(' ms')))

					this.separator()
				}

				// Launch the server
				launchServer(this)
			})

			// Let the world know that we're ready
			this.events.emit('config loaded', this)
		}.bind(this))
	}

	run() {
		this.ready = this.go()
		return this.ready
	}

	get(url, func) {
		this.route('GET', url, func)
	}

	post(url, func) {
		this.route('POST', url, func)
	}

	route(method, url, func) {
		if(!this.server || !this.events) {
			this.past.routes.push(() => this.route(method, url, func))
			return
		}

		// RegEx
		if(url instanceof RegExp) {
			this.server.regexRoutes[method].add({
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
		this.server.routes[method][url] = func
		this.events.emit('route modified', method, url)
	}

	unroute(pageId) {
		if(!this.server)
			return

		Object.keys(this.server.routes).forEach(method => {
			let routes = this.server.routes[method]
			let raw = this.server.raw[method]

			if(!(pageId in routes))
				return

			console.log(`Deleting ${method} route:`, chalk.blue(pageId))

			delete routes[pageId]
			delete raw[pageId]
		})
	}

	rewrite(func) {
		this.server.rewrite = func
	}

	time(phase) {
		this.benchmarks[phase] = new Date()
	}

	timeEnd(phase) {
		this.benchmarks[phase] = new Date() - this.benchmarks[phase]
	}

	separator(color) {
		if(!this.verbose)
			return

		let msg = '-'.repeat(79)

		if(color)
			console.log(color(msg))
		else
			console.log(msg)
	}

	use() {
		for (let i = 0; i < arguments.length; i++) {
			if(this.server)
				this.server.modifiers.push(arguments[i])
			else
				this.past.middleware.push(arguments[i])
		}
	}

	on(eventName, func) {
		this.past.events.push({
			eventName,
			func
		})

		if(this.events) {
			this.events.on(eventName, func)
		}
	}

	stop() {
		return Promise.all([
			this.server ? this.server.stop() : Promise.resolve(),
			this.liveReload ? this.liveReload.stop() : Promise.resolve()
		])
	}

	restart() {
		return this.stop().then(() => this.run())
	}

	loading(type, what) {
		if(this.overwriteLoadingMessages)
			process.stdout.write(`Loading ${type}: ${what}\r`)
		else
			console.log(`Loading ${type}: ${what}`)
	}

	watchFiles() {
		// Watch for layout modifications
		watch(this.config.path.layout, () => {
			this.events.emit('layout modified')
		})

		// Watch for page modifications
		watch(this.config.path.pages, filePath => {
			let pageId = path.dirname(path.relative(this.config.path.pages, filePath))
			this.events.emit('page modified', pageId)
		})

		// Watch for style modifications
		watchFlatDirectory(this.config.path.styles, '.styl', this.events, 'style modified')

		// Watch for script modifications
		watchFlatDirectory(this.config.path.scripts, '.js', this.events, 'script modified')

		// Watch for config modifications
		watch('./config.json', filePath => this.events.emit('config modified'))

		// GitHub service hook
		this.server.routes.POST['git/pull'] = (request, response) => {
			if(this.updating)
				return

			this.updating = true
			console.log('Updating...')

			exec('git pull')
				.then(stdout => {
					this.updating = false

					console.log(stdout)

					response.writeHead(200)
					response.end(stdout)
				})
				.catch(error => {
					response.writeHead(500)
					response.end(stdout)
				})
		}
	}

	loadPage(pageId) {
		let pagePath = path.join(this.config.path.pages, pageId)

		if(path.sep !== '/')
			pageId = pageId.replace(path.sep, '/')

		if(this.verbose)
			this.loading('page', chalk.blue(pageId))

		return new Page(pageId, pagePath, page => {
			// Ignore empty directories
			if(!page.controller && !page.template) {
				this.unroute(pageId)
				return
			}

			this.events.emit('page loaded', page)
		})
	}

	registerEventListeners() {
		// Load all styles
		let recompileStyles = () => {
			this.separator(chalk.magenta)

			let asyncStyleCompileTasks = this.config.styles.map(styleId => {
				if(this.verbose)
					this.loading('style', chalk.magenta(styleId))

				let stylePath = path.join(this.config.path.styles, styleId + '.styl')

				return loadStyle(stylePath).then(code => {
					let style = {
						id: styleId,
						code
					}

					this.events.emit('style loaded', style)
					return style
				})
			})

			return Promise.all(asyncStyleCompileTasks).then(results => {
				this.css = results
				this.events.emit('all styles loaded')
			})
		}

		// Load all scripts
		let recompileScripts = () => {
			this.separator(chalk.cyan)

			let asyncScriptCompileTasks = this.config.scripts.map(scriptId => {
				if(this.verbose)
					this.loading('script', chalk.cyan(scriptId))

				return loadScript(path.join(this.config.path.scripts, scriptId + '.js')).then(code => {
					let script = {
						id: scriptId,
						code
					}

					this.events.emit('script loaded', script)
					return script
				})
			})

			return Promise.all(asyncScriptCompileTasks).then(results => {
				this.js = results
				this.events.emit('all scripts loaded')
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
		let reloadPages = () => {
			this.separator(chalk.blue)

			return findPages(this.config.path.pages)
				.map(pagePath => path.relative(this.config.path.pages, pagePath))
				.map(this.loadPage.bind(this))
				.then(() => {
					// Create default home page if there is no page configured yet
					if(this.pages.size === 0) {
						let homePath = path.join(this.config.path.pages, 'home')
						let homeTemplate = path.join(homePath, 'home.jade')
						let homeJSON = path.join(homePath, 'home.json')

						mkdir(homePath)
							.then(() => fs.writeFileAsync(homeTemplate, 'h1 Hello Aero\np Edit this page in ' + homeTemplate, 'utf8'))
							.then(() => fs.writeFileAsync(homeJSON, JSON.stringify({
								url: ''
							}, null, '\t'), 'utf8'))
							.then(() => this.loadPage('home'))
							.then(() => {
								this.watchFiles()
							})
					} else {
						this.watchFiles()
					}
				})
				.then(() => {
					if(!this.liveReload)
						return

					this.liveReload.broadcast({
						title: 'reload'
					})
				})
		}

		// Aero config loaded
		this.events.on('config loaded', Promise.coroutine(function*() {
			// Favicon
			loadFavIcon(path.join(this.root, this.config.favIcon), imageData => {
				this.server.favIconData = imageData
			})

			// Create directories
			yield Promise.all(Object.keys(this.config.path).map(directory => mkdir(directory)))

			// Security
			if(this.config.security && this.config.security.key && this.config.security.cert) {
				this.security = yield {
					key: getFile(path.join(this.config.path.security, this.config.security.key), '', 'ascii', false),
					cert: getFile(path.join(this.config.path.security, this.config.security.cert), '', 'ascii', false)
				}

				if(!this.security.key)
					console.error(chalk.red(`Failed to load security key: ${this.config.security.key}`))

				if(!this.security.cert)
					console.error(chalk.red(`Failed to load security certificate: ${this.config.security.cert}`))
			}

			// Live reload
			if(!this.production)
				this.liveReload = new LiveReload(this.security, this.config.ports.liveReload)

			// Static files
			this.config.static.forEach(directory => {
				this.get(directory, this.static.serve(this.root))
			})

			// Start downloading fonts definitions
			if(this.config.fonts.length > 0) {
				if(this.verbose)
					this.loading('fonts', chalk.bold(this.config.fonts.join(', ')))

				this.time('Fonts')

				this.downloadFonts =
					download('https://fonts.googleapis.com/css?family=' + this.config.fonts.join('|'))
					.then(style => {
						this.timeEnd('Fonts')
						return style
					})
			}

			// Plugins
			this.time('Plugins')

			if(this.package.dependencies)
				this.plugins = Object.keys(this.package.dependencies).filter(dependency => dependency.startsWith('aero-'))
			else
				this.plugins = []

			// Figure out which plugins need to be installed
			let uninstalledPlugins =
				this.plugins
				//.map(plugin => 'aero-' + plugin)
				.filter(plugin => {
					try {
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
			this.separator(chalk.yellow)
			this.loadPlugins = Promise.each(this.plugins, Promise.coroutine(function*(pluginName) {
				let shortPluginName = pluginName.replace('aero-', '')

				if(this.verbose)
					this.loading('plugin', chalk.yellow(shortPluginName))

				let plugin = require(pluginName)

				// If it's defined as a function, execute it and get an instance
				if(typeof plugin === 'function') {
					if(plugin.constructor.name === 'GeneratorFunction') {
						plugin = Promise.coroutine(plugin)
						plugin = yield plugin(this)
					} else {
						plugin = plugin(this)
					}
				}

				// Save as a part of the app
				this[shortPluginName] = plugin

				let tasks = []

				if(plugin.scripts) {
					tasks.push(
						Promise.all(plugin.scripts.map(scriptName => {
							let scriptPath = require.resolve(`${pluginName}/${scriptName}`)
							return loadScript(scriptPath)
						})).each(script => {
							this.pluginScripts.push(script)
						})
					)
				}

				if(plugin.styles) {
					tasks.push(
						Promise.all(
							plugin.styles
							.map(styleName => loadStyle(require.resolve(`${pluginName}/${styleName}.styl`)))
						).each(style => this.pluginStyles.push(style))
					)
				}

				return Promise.all(tasks).catch(error => console.error(chalk.red(error)))
			}.bind(this))).then(() => {
				// Remove trailing whitespace from scripts
				this.pluginScripts = this.pluginScripts.map(code => code.trim())
			})

			// Wait for plugins to finish loading
			yield this.loadPlugins.then(() => this.timeEnd('Plugins'))

			// Layout
			this.time('Layout')

			this.layout = yield new Layout(this.config.path.layout, layout => {
				this.events.emit('layout loaded', layout)

				this.time('Styles')
				this.time('Scripts')

				Promise.all([
						recompileStyles().then(() => this.timeEnd('Styles')),
						recompileScripts().then(() => this.timeEnd('Scripts'))
					])
					.then(() => this.time('Pages'))
					.then(Promise.coroutine(function*() {
						if(!this.downloadFonts)
							return

						this.fontDefinitions = yield this.downloadFonts

						// Remove newline characters
						this.fontDefinitions = this.fontDefinitions.replace(/(?:\r\n|\r|\n)/g, '')
					}.bind(this)))
					.then(reloadPages)
					.then(() => this.timeEnd('Pages'))
					.then(() => {
						if(!this.verbose || !this.showStyleSize || this.css.length === 0)
							return

						this.separator(chalk.magenta)

						this.css.forEach(style => {
							if(!style.code) {
								console.log('Style', chalk.magenta(style.id), ' '.repeat(Math.max(70 - 'Error'.length - style.id.length, 0)), chalk.red('Error'))
								return
							}

							let size = (style.code.length / 1024).toFixed(1)
							console.log('Style', chalk.magenta(style.id), ' '.repeat(Math.max(67 - size.length - style.id.length, 0)), size, chalk.dim('KB'))
						})

						let size = (this.css.map(style => style.code ? style.code.length : 0).reduce((a, b) => a + b) / 1024).toFixed(1)
						let title = 'Total ' + chalk.dim('(uncompressed)')
						console.log(title, ' '.repeat(Math.max(73 - chalk.stripColor(title).length - size.length, 0)), size, chalk.dim('KB'))
					})
					.then(() => this.events.emit('all pages loaded'))
			})

			this.timeEnd('Layout')
		}.bind(this)))

		// Pending route checks
		this.events.on('server started', () => {
			this.pendingRouteChecks.map(check => check())
		})

		// Layout modifications
		this.events.on('layout modified', Promise.coroutine(function*() {
			this.layout = yield new Layout(this.config.path.layout)
			this.events.emit('layout loaded')

			reloadPages()
		}.bind(this)))

		// Recompile styles when modified
		this.events.on('style modified', () => {
			recompileStyles().then(reloadPages)
		})

		// Recompile scripts when modified
		this.events.on('script modified', () => {
			recompileScripts().then(reloadPages)
		})

		// Page modifications
		this.events.on('page modified', pageId => {
			this.loadPage(pageId)
		})

		// Page loaded
		this.events.on('page loaded', page => {
			// Register page
			this.pages.set(page.id, page)

			// Get render function
			let getPageRenderFunction = (page, request, response) => {
				return params => {
					response.end(page.wrap(page.template(Object.assign({}, request.globals, page.json, params))))
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
			let js = (this.liveReload ? this.liveReload.script : '') + this.pluginScripts.join(';') + this.js.map(script => script.code).join(';') // '"use strict";' +
			let mobileMetaTag = '<meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, user-scalable=yes">'

			let renderLayoutTemplate = params => {
				// Hacky, but works for now™
				return this.layout.template(params)
					.replace('</head><body', `${mobileMetaTag}<style>${css}</style></head><body`)
					.replace('</body></html>', `<script>${js}</script></body></html>`)
			}

			if(this.layout.css)
				css += this.layout.css

			if(this.fontDefinitions)
				css = this.fontDefinitions + css

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

					zlib.gzip(finalCode, fastCompressionOptions, (error, gzippedCode) => {
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

											respond(renderLayoutTemplate(layoutControllerParams), response)
										} else {
											respond(renderLayoutTemplate(Object.assign({
													content: code,
													app: this
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
									let code = page.wrap(renderPageTemplate(Object.assign({}, page.json, params, page.defaultParams)))

									let layoutParams = {
										content: code,
										app: this
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
						app: this
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

							this.get(page.url, (request, response) => {
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
		})

		// Check page when it's available on the server
		this.events.on('route modified', (method, url) => {
			// Live reload
			if(this.liveReload) {
				this.liveReload.broadcast({
					title: 'route modified',
					url: '/' + url
				})
			}

			// Check route
			this.checkRoute(method, url).then(
				function resolve() {
					// ...
				},
				function reject(error) {
					// These are standard rejections: Ignore them
					if(error.message === 'server not started' || error.message === 'static route')
						return

					throw error
				}
			)
		})

		// Config modifications
		this.events.on('config modified', () => {
			if(this.verbose) {
				let msg = 'Restarting Aero because config.json has been modified'
				let separator = '-'.repeat(msg.length)

				console.log(chalk.bold(separator))
				console.log(chalk.bold(msg))
				console.log(chalk.bold(separator))
			}

			this.restart()
		})
	}

	checkRoute(method, relativePath) {
		// We don't test static routes
		if(this.config.static.indexOf(relativePath) !== -1)
			return Promise.reject(new Error('static route'))

		if(!this.serverStarted) {
			this.pendingRouteChecks.push(this.checkRoute.bind(this, method, relativePath))
			return Promise.reject(new Error('server not started'))
		}

		let url = `${this.server.protocol}://localhost:${this.server.port}/${relativePath}`;
		let startTime = new Date()

		return requester[`${method.toLowerCase()}Async`]({
			uri: url,
			timeout: 3000,
			encoding: null,
			rejectUnauthorized: false
		})
		.then(response => {
			let responseTime = new Date() - startTime

			let pageStatusLog = msg => {
				let methodMsg = method + ' '.repeat(5 - method.length)

				let ok = `${url}`
				ok += ' '.repeat(Math.max(76 - ok.length - chalk.stripColor(msg).length - methodMsg.length, 0))

				console.log(methodMsg, chalk.blue(ok), msg)
			}

			if(response.statusCode !== 200) {
				pageStatusLog(chalk.red(response.statusCode))
				return Promise.resolve(response.statusCode)
			}

			if(this.verbose) {
				let formatTime = responseTime < 200 ? chalk.green : (responseTime < 1000 ? chalk.yellow : chalk.red)
				let formatSize = response.body.length < 14 * 1024 ? chalk.green : (response.body.length < 100 * 1024 ? chalk.yellow : chalk.red)

				let size = `${(response.body.length / 1024).toFixed(1)}`
				size = ' '.repeat(Math.max(6 - size.length, 0)) + formatSize(size) + chalk.dim(' KB')

				let time = `${responseTime}`
				time = ' '.repeat(Math.max(5 - time.length, 0)) + formatTime(time) + chalk.dim(' ms')

				pageStatusLog(size + ' ' + time)
			}

			let pageLog = logMsg => console.log(chalk.blue('/' + relativePath + ' '.repeat(Math.max(76 - chalk.stripColor(logMsg).length - relativePath.length, 0))), logMsg)

			// HTML5 check
			let checkHTML5 = code => html5Lint(code).then(results => results.messages)

			let checkHTML5Response = response => {
				if(response.headers['content-encoding'] === 'gzip') {
					return zlib.gunzipAsync(response.body)
						.then(unzippedCode => unzippedCode.toString())
						.then(checkHTML5)
				} else {
					return checkHTML5(response.body)
				}
			}

			// HTML5 validator
			let contentType = response.headers['content-type']

			if(method === 'GET' && contentType && contentType.includes('text/html')) {
				return checkHTML5Response(response)
					.then(messages => {
						if(messages.length === 0) {
							pageLog(chalk.green('HTML'))
							return
						}

						messages.forEach(msg => console.log(chalk.blue('/' + relativePath) + ' ' + chalk.yellow(msg.message)))
					})
					.catch(error => {
						console.error(chalk.red(`https://html5.validator.nu/ seems to be offline`));
					})
			}

			// JSON validator
			if(response.body.toString().startsWith('{')) {
				try {
					JSON.parse(response.body)

					let validMsg = 'JSON'

					// Green if the JSON file is valid and content type fits
					// Yellow if the JSON file is valid and content type is not correct
					let color = chalk.green
					if(!contentType || contentType.indexOf('application/json') === -1) {
						color = chalk.yellow
						validMsg = 'Content type not set to application/json'
					}

					pageLog(color(validMsg))
				} catch(error) {
					pageLog(chalk.red(error.toString()))
				}
			}

			return Promise.resolve(response.statusCode)
		})
		.catch(e => {
			console.error(chalk.red(`Error fetching ${url}`))
			return Promise.reject(e)
		})
	}
}

module.exports = Aero