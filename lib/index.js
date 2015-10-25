'use strict';

// Modules
let fs = require('fs');
let path = require('path');
let zlib = require('zlib');
let etag = require('etag');
let chalk = require('chalk');
let mkdir = require('mkdirp');
let watch = require('node-watch');
let Promise = require('bluebird');
let merge = require('object-assign');

// Functions
let getFile = require('./functions/getFile');
let download = require('./functions/download');
let loadStyle = require('./functions/loadStyle');
let loadScript = require('./functions/loadScript');
let loadFavIcon = require('./functions/loadFavIcon');
let launchServer = require('./functions/launchServer');
let watchFlatDirectory = require('./functions/watchFlatDirectory');

// Classes
let Page = require('./classes/Page');
let Layout = require('./classes/Layout');
let Server = require('./classes/Server');
let LiveReload = require('./classes/LiveReload');
let EventEmitter = require('./classes/EventEmitter');

// Promisify
Promise.promisifyAll(fs);
mkdir = Promise.promisify(mkdir);

// Aero definition
let aero = {};

// Default config
let defaultConfig = require('../default/config');

// Components
aero.verbose = true;
aero.events = new EventEmitter();
aero.pages = new Map();
aero.server = new Server();
aero.staticFileCache = {};
aero.pluginScripts = [];
aero.pluginStyles = [];

// run
aero.run = Promise.coroutine(function*() {
	let config = yield getFile('config.json', defaultConfig).then(JSON.parse);

	// Set config to the data in the 'aero' field
	this.config = merge(defaultConfig, config);

	// Register event listeners
	this.registerEventListeners();

	// Let the world know that we're ready
	this.events.emit('config loaded', aero);
});

// on
aero.on = function(eventName, func) {
	aero.events.on(eventName, func);
};

// stop
aero.stop = function() {
	if(this.server)
		this.server.close();

	if(this.liveReload && this.liveReload.server)
		this.liveReload.server.close();
};

// registerEventListeners
aero.registerEventListeners = function() {
	// Load all styles
	let recompileStyles = function() {
		let asyncStyleCompileTasks = aero.config.styles.map(function(styleId) {
			if(aero.verbose)
				console.log(`Loading style: ${styleId}`);
			let stylePath = path.join(aero.config.path.styles, styleId + '.styl');
			return loadStyle(stylePath);
		});

		return Promise.all(asyncStyleCompileTasks).then(function(results) {
			aero.css = results;
			aero.events.emit('styles loaded');
		});
	};

	// Load all scripts
	let recompileScripts = function() {
		let asyncScriptCompileTasks = aero.config.scripts.map(function(scriptId) {
			if(aero.verbose)
				console.log(`Loading script: ${scriptId}`);

			return loadScript(path.join(aero.config.path.scripts, scriptId + '.js'));
		});

		return Promise.all(asyncScriptCompileTasks).then(function(results) {
			aero.js = results;
			aero.events.emit('scripts loaded');
		});
	};

	let findPages = Promise.coroutine(function*(rootPath) {
		let dirs =
			fs.readdirAsync(rootPath)
			.map(file => path.join(rootPath, file))
			.filter(file => fs.statSync(file).isDirectory())

		let subs =
			dirs.map(dir => findPages(dir));

		return (yield dirs).concat(yield subs).reduce((a, b) => a.concat(b), []);
	});

	// Reload pages
	let reloadPages = function() {
		findPages(aero.config.path.pages)
		.map(pagePath => path.relative(aero.config.path.pages, pagePath))
		.map(aero.loadPage)
		.then(function() {
			// Create default home page if there is no page configured yet
			if(aero.pages.size === 0) {
				let homePath = path.join(aero.config.path.pages, 'home');
				let homeTemplate = path.join(homePath, 'home.jade');
				let homeJSON = path.join(homePath, 'home.json');

				mkdir(homePath)
					.then(() => fs.writeFileAsync(homeTemplate, 'h1 Hello Aero\np Edit this page in ' + homeTemplate, 'utf8'))
					.then(() => fs.writeFileAsync(homeJSON, JSON.stringify({url: ''}, null, '\t'), 'utf8'))
					.then(() => aero.loadPage('home'));
			}
		})
		.then(function() {
			// Watch for modifications
			aero.watchFiles();
		});
	};

	// Aero config loaded
	this.events.on('config loaded', Promise.coroutine(function*() {
		// Favicon
		loadFavIcon(aero.config.favIcon, function(imageData) {
			aero.server.favIconData = imageData;
		});

		// Download fonts definitions
		if(aero.config.fonts.length > 0)
			aero.fontDefinitions = yield download('https://fonts.googleapis.com/css?family=' + aero.config.fonts.join('|'));

		// Create directories
		yield Promise.all(Object.keys(aero.config.path).map(directory => mkdir(directory)));

		// Load plugins
		yield Promise.each(Object.keys(aero.config.plugins), function(pluginName) {
			if(aero.verbose)
				console.log(`Loading plugin: ${pluginName}`);

			let plugin = require('../plugins/' + pluginName);

			if(plugin.scripts) {
				return Promise.all(plugin.scripts.map(function(scriptName) {
					let scriptPath = require.resolve(`../plugins/${pluginName}/${scriptName}`);
					return loadScript(scriptPath);
				})).each(function(script) {
					aero.pluginScripts.push(script);
				});
			}

			if(plugin.styles) {
				return Promise.all(
					plugin.styles
					.map(styleName => loadStyle(require.resolve(`../plugins/${pluginName}/${styleName}.styl`)))
				).each(style => aero.pluginStyles.push(style));
			}

			if(plugin.init)
				return plugin.init(aero.config.plugins[pluginName]);

			return Promise.resolve();
		});

		// Layout
		aero.layout = yield new Layout(aero.config.path.layout, function(layout) {
			aero.events.emit('layout loaded', layout);
			recompileStyles().then(recompileScripts).then(reloadPages);
		});

		// Static files
		aero.config.static.forEach(aero.static);

		// Security
		if(aero.config.security && aero.config.security.key && aero.config.security.cert) {
			aero.security = yield Promise.props({
				key: getFile(path.join(aero.config.path.security, aero.config.security.key), '', 'ascii', false),
				cert: getFile(path.join(aero.config.path.security, aero.config.security.cert), '', 'ascii', false)
			});

			if(!aero.security.key)
				console.error(chalk.red(`Failed to load security key: ${aero.config.security.key}`));

			if(!aero.security.cert)
				console.error(chalk.red(`Failed to load security certificate: ${aero.config.security.cert}`));
		}

		// Live reload
		aero.liveReload = new LiveReload(aero.security, aero.config.liveReloadPort);

		// Launch the server
		launchServer(aero);
	}));

	// Layout modifications
	this.events.on('layout modified', Promise.coroutine(function*() {
		aero.layout = yield new Layout(aero.config.path.layout);
		aero.events.emit('layout loaded');
		reloadPages();
	}));

	// Recompile styles when modified
	this.events.on('style modified', function() {
		recompileStyles().then(reloadPages);
	});

	// Recompile scripts when modified
	this.events.on('script modified', function() {
		recompileScripts().then(reloadPages);
	});

	// Page modifications
	this.events.on('page modified', function(pageId) {
		aero.loadPage(pageId);
	});

	// Page loaded
	this.events.on('page loaded', function(page) {
		// Register page
		aero.pages.set(page.id, page);

		// Register a raw route
		if(page.controller) {
			aero.server.raw[page.url] = page.controller.get.bind(page.controller);
		} else {
			aero.server.raw[page.url] = function(request, response) {
				response.end(page.code);
			};
		}

		// This should be close to the MTU size of a TCP packet.
		// Regarding performance it makes no sense to compress smaller files.
		// Bandwidth can be saved however the savings are minimal for small files
		// and the overhead of compressing can lead up to a 75% reduction
		// in server speed under high load. Therefore in this case
		// we're trying to optimize for performance, not bandwidth.
		const gzipThreshold = 1450;

		let css =  aero.pluginStyles.join(' ') + aero.css.join(' ');
		let js = '"use strict";' + aero.liveReload.script + aero.pluginScripts.join(';') + aero.js.join(';');
		let renderLayoutTemplate = aero.layout.template;

		if(aero.layout.css)
			css += aero.layout.css;

		if(aero.fontDefinitions)
			css = aero.fontDefinitions + css;

		let headers = {
			'Content-Type': 'text/html;charset=utf-8',
			'Vary': 'Accept-Encoding'
		};

		let bestCompressionOptions = {
			level: zlib.Z_BEST_COMPRESSION
		};

		let fastCompressionOptions = {
			level: zlib.Z_DEFAULT_COMPRESSION
		};

		let respond = function(finalCode, response) {
			if(finalCode.length >= gzipThreshold) {
				headers['Content-Encoding'] = 'gzip';

				zlib.gzip(finalCode, fastCompressionOptions, function(error, gzippedCode) {
					headers['Content-Length'] = gzippedCode.length;

					response.writeHead(200, headers);
					response.end(gzippedCode);
				});
			} else {
				headers['Content-Length'] = Buffer.byteLength(finalCode, 'utf8');

				response.writeHead(200, headers);
				response.end(finalCode);
			}
		};

		// Routing
		if(page.controller && page.controller.render) {
			let renderPageTemplate = page.template;
			let renderPage = page.controller.render;

			// Syntax error while compiling the template?
			// Then let's send over a live reload script until it's fixed
			if(!renderPageTemplate) {
				aero.get(page.url, function(request, response) {
					response.end('<script>' + aero.liveReload.script + '</script>');
				});
				return;
			}

			if(aero.layout.controller) {
				let renderLayout = aero.layout.controller.render.bind(aero.layout.controller);

				// Dynamic layout + Dynamic page
				aero.get(page.url, function(request, response) {
					renderLayout(request, function(layoutControllerParams) {
						renderPage(request, function(params) {
							let code = renderPageTemplate(params);

							if(layoutControllerParams) {
								if(aero.layout.json)
									layoutControllerParams = merge(aero.layout.json, layoutControllerParams);

								layoutControllerParams.content = code;
								layoutControllerParams.css = css;
								layoutControllerParams.js = js;
								layoutControllerParams.siteName = aero.config.siteName;

								respond(renderLayoutTemplate(layoutControllerParams), response);
							} else {
								respond(renderLayoutTemplate(merge(aero.layout.json, {
									content: code,
									css: css,
									js: js,
									siteName: aero.config.siteName
								})), response);
							}
						});
					});
				});
			} else {
				// Static layout + Dynamic page
				aero.get(page.url, function(request, response) {
					renderPage(request, function(params) {
						let layoutParams = {
							content: renderPageTemplate(params),
							css: css,
							js: js,
							siteName: aero.config.siteName
						};

						if(aero.layout.json)
							layoutParams = merge(aero.layout.json, layoutParams);

						respond(renderLayoutTemplate(layoutParams), response);
					});
				});
			}
		} else {
			if(page.controller) {
				// Completely user-controlled dynamic page (e.g. API calls)
				aero.get(page.url, page.controller.get.bind(page.controller));
			} else if(aero.layout.controller) {
				let renderLayout = aero.layout.controller.render.bind(aero.layout.controller);

				// Dynamic layout + Static page
				aero.get(page.url, function(request, response) {
					renderLayout(request, function(layoutControllerParams) {
						if(aero.layout.json)
							layoutControllerParams = merge(aero.layout.json, layoutControllerParams);

						layoutControllerParams.content = page.code;
						layoutControllerParams.js = js;
						layoutControllerParams.css = css;
						layoutControllerParams.siteName = aero.config.siteName;

						respond(renderLayoutTemplate(layoutControllerParams), response);
					});
				});
			} else {
				// Static layout + Static page
				let layoutParams = {
					content: page.code,
					css: css,
					js: js,
					siteName: aero.config.siteName
				};

				if(aero.layout.json)
					layoutParams = merge(layoutParams, aero.layout.json);

				let staticPageCode = renderLayoutTemplate(layoutParams);

				if(staticPageCode.length >= gzipThreshold) {
					headers['Content-Encoding'] = 'gzip';

					zlib.gzip(staticPageCode, bestCompressionOptions, function(error, gzippedCode) {
						headers['Content-Length'] = gzippedCode.length;
						headers.ETag = etag(gzippedCode);

						aero.get(page.url, function(request, response) {
							response.writeHead(200, headers);
							response.end(gzippedCode);
						});
					});
				} else {
					headers['Content-Length'] = Buffer.byteLength(staticPageCode, 'utf8');
					headers.ETag = etag(staticPageCode);

					aero.get(page.url, function(request, response) {
						response.writeHead(200, headers);
						response.end(staticPageCode);
					});
				}
			}
		}

		// Live reload
		aero.liveReload.broadcast(page.id);
	});
};

// watchFiles
aero.watchFiles = function() {
	// Watch for layout modifications
	watch(this.config.path.layout, function() {
		aero.events.emit('layout modified');
	});

	// Watch for page modifications
	watch(this.config.path.pages, function(filePath) {
		let pageId = path.dirname(path.relative(aero.config.path.pages, filePath));
		aero.events.emit('page modified', pageId);
	});

	// Watch for style modifications
	watchFlatDirectory(aero.config.path.styles, '.styl', aero.events, 'style modified');

	// Watch for script modifications
	watchFlatDirectory(aero.config.path.scripts, '.js', aero.events, 'script modified');
};

// loadPage
aero.loadPage = function(pageId) {
	let pagePath = path.join(aero.config.path.pages, pageId);

	if(aero.verbose)
		console.log(`Loading page: ${pageId}`);

	return new Page(pageId, pagePath, function(page) {
		// Ignore empty directories
		if(!page.controller && !page.template)
			return;

		aero.events.emit('page loaded', page);
	});
};

// get
aero.get = function(url, func) {
	// RegEx
	if(url instanceof RegExp) {
		aero.server.regexRoutes.add({
			regEx: url,
			route: func
		});
		return;
	}

	// Remove starting slash
	if(url.startsWith('/'))
		url = url.substr(1);

	// Remove ending slash
	if(url.endsWith('/'))
		url = url.slice(0, -1);

	// Save route
	aero.server.routes[url] = func;
};

// use
aero.use = function(func) {
	aero.server.modifiers.push(func);
};

// static
aero.static = function(directory) {
	const staticFileSizeCachingThreshold = 512 * 1024; // 512 KB

	let lookup = require('mime-types').lookup;

	aero.get(directory, function(request, response) {
		let url = request.url.substr(1);

		// Let's not send the contents of our whole file system to potential hackers.
		// Except for Windows because Windows servers deserve to be hacked.
		if(url.includes('../')) {
			response.end();
			return;
		}

		let cachedFile = aero.staticFileCache[url];

		if(cachedFile) {
			response.writeHead(200, cachedFile.headers);
			response.end(cachedFile.data);
		} else {
			fs.stat(url, function(statError, stats) {
				if(statError) {
					console.error(chalk.red(statError));
					response.writeHead(404);
					response.end();
					return;
				}

				if(!stats.isFile()) {
					response.writeHead(404);
					response.end();
					return;
				}

				let headers = {
					'Content-Length': stats.size,
					'Cache-Control': 'max-age=864000',
					'ETag': etag(stats)
				};

				let mimeType = lookup(url);

				if(mimeType === false) {
					response.writeHead(404);
					response.end();
					return;
				}

				// Cache headers
				headers['Content-Type'] = mimeType;

				// Send file
				response.writeHead(200, headers);

				// To cache or not to cache, that is the question!
				if(mimeType.indexOf('image/') !== -1 && stats.size <= staticFileSizeCachingThreshold) {
					fs.readFile(url, function(readError, data) {
						if(readError) {
							console.error(chalk.red(readError));
							response.writeHead(404);
							response.end();
							return;
						}

						aero.staticFileCache[url] = {
							headers: headers,
							data: data
						};

						response.end(data);
					});
				} else {
					fs.createReadStream(url).pipe(response);
				}
			});
		}
	});
};

module.exports = aero;