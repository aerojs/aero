// Modules
let path = require("path");
let zlib = require("zlib");
let watch = require("node-watch");
let Promise = require("bluebird");
let merge = require("object-assign");

// Functions
let getFile = require("./functions/getFile");
let loadStyle = require("./functions/loadStyle");
let loadFavIcon = require("./functions/loadFavIcon");
let launchServer = require("./functions/launchServer");
let loadDirectory = require("./functions/loadDirectory");
let watchFlatDirectory = require("./functions/watchFlatDirectory");

// Classes
let Page = require("./classes/Page");
let Layout = require("./classes/Layout");
let Server = require("./classes/Server");
let LiveReload = require("./classes/LiveReload");
let EventEmitter = require("./classes/EventEmitter");

// Aero
let aero = {
	events: new EventEmitter(),
	pages: new Map(),
	server: new Server(),
	staticFileCache: {},

	run: Promise.coroutine(function*() {
		let defaultPackage = require("../default/package");

		this.package = yield getFile("package.json", defaultPackage).then(JSON.parse);

		// Set config to the data in the "aero" field
		this.config = merge(defaultPackage.aero, aero.package.aero);

		// Register event listeners
		this.registerEventListeners();

		// Let the world know that we're ready
		this.events.emit("config loaded", aero);

		// Watch for modifications
		this.watchFiles();
	}),

	// registerEventListeners
	registerEventListeners: function() {
		// Aero config loaded
		this.events.on("config loaded", Promise.coroutine(function*() {
			loadFavIcon(aero.config.favIcon, function(imageData) {
				aero.server.favIconData = imageData;
			});

			// Layout
			aero.layout = yield new Layout(aero.config.path.layout, function(page) {
				aero.events.emit("layout loaded", page);
			});

			// Live reload
			aero.liveReload = new LiveReload(aero.config.liveReloadPort);

			// Static files
			aero.config.static.forEach(aero.static);

			// Scripts
			//aero.config.scripts.forEach();

			// Launch the server
			launchServer(aero);
		}));

		// Layout modifications
		this.events.on("layout modified", Promise.coroutine(function*() {
			aero.layout = yield new Layout(aero.config.path.layout, function(page) {
				aero.events.emit("layout loaded", page);
			});
		}));

		// Recompile styles
		let recompileStyles = function() {
			// Load all styles
			let asyncStyleCompileTasks = aero.config.styles.map(function(styleId) {
				return loadStyle(path.join(aero.config.path.styles, styleId + ".styl"));
			});

			Promise.all(asyncStyleCompileTasks).then(function(results) {
				aero.css = results;
				aero.events.emit("styles loaded");
			});
		};

		// Recompile styles
		this.events.on("layout loaded", recompileStyles);
		this.events.on("style modified", recompileStyles);

		// Styles loaded
		this.events.on("styles loaded", function() {
			// Reload all pages
			loadDirectory(aero.config.path.pages, aero.loadPage);
		});

		// Page modifications
		this.events.on("page modified", function(pageId) {
			aero.loadPage(pageId);
		});

		// Page loaded
		this.events.on("page loaded", function(page) {
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

			const gzipThreshold = 1024;

			let css = aero.css.join(" ") + " " + aero.layout.css;
			let js = aero.liveReload.script;
			let renderLayoutTemplate = aero.layout.template;

			let headers = {
				"Content-Type": "text/html"
			};

			let bestCompressionOptions = {
				level: zlib.Z_BEST_COMPRESSION
			};

			let fastCompressionOptions = {
				level: zlib.Z_DEFAULT_COMPRESSION
			};

			let respond = function(finalCode, response) {
				if(finalCode.length >= gzipThreshold) {
					headers["Content-Encoding"] = "gzip";

					response.writeHead(200, headers);

					zlib.gzip(finalCode, fastCompressionOptions, function(error, gzippedCode) {
						response.end(gzippedCode);
					});
				} else {
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
						response.end("<script>" + aero.liveReload.script + "</script>");
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
						layoutParams = merge(aero.layout.json, layoutParams);

					let staticPageCode = renderLayoutTemplate(layoutParams);

					if(staticPageCode.length >= gzipThreshold) {
						headers["Content-Encoding"] = "gzip";

						zlib.gzip(staticPageCode, bestCompressionOptions, function(error, gzippedCode) {
							aero.get(page.url, function(request, response) {
								response.writeHead(200, headers);
								response.end(gzippedCode);
							});
						});
					} else {
						aero.get(page.url, function(request, response) {
							response.writeHead(200, headers);
							response.end(staticPageCode);
						});
					}
				}
			}

			// Live reload
			aero.liveReload.server.broadcast(page.id);
		});
	},

	// watchFiles
	watchFiles: function() {
		// Watch for layout modifications
		watch(this.config.path.layout, function() {
			aero.events.emit("layout modified");
		});

		// Watch for page modifications
		watch(this.config.path.pages, function(filePath) {
			let relativeFilePath = path.relative(aero.config.path.pages, filePath);
			let pageId = path.dirname(relativeFilePath);

			aero.events.emit("page modified", pageId);
		});

		// Watch for style modifications
		watchFlatDirectory(aero.config.path.styles, ".styl", aero.events, "style modified");

		// Watch for script modifications
		watchFlatDirectory(aero.config.path.scripts, ".js", aero.events, "script modified");
	},

	// loadPage
	loadPage: function(pageId) {
		return new Page(pageId, path.join(aero.config.path.pages, pageId), function(page) {
			aero.events.emit("page loaded", page);
		});
	},

	// get
	get: function(url, route) {
		aero.server.routes[url] = route;
	},

	// static
	static: function(directory) {
		const staticFileSizeCachingThreshold = 512 * 1024; // 512 KB

		let fs = require("fs");
		let etag = require("etag");
		let mmm = require("mmmagic");
		let Magic = mmm.Magic;
		let magic = new Magic(mmm.MAGIC_MIME_TYPE);

		aero.get(directory, function(request, response) {
			let url = request.url.substr(1);

			// Let's not send the contents of our whole file system to potential hackers.
			// Except for Windows because Windows servers deserve to be hacked. #opinionated
			if(url.indexOf("../") !== -1) {
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
						console.error(statError);
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
						"Content-Length": stats.size,
						"ETag": etag(stats)
					};

					magic.detectFile(url, function(mimeError, mimeType) {
						if(mimeError) {
							console.error(mimeError);
							response.writeHead(404);
							response.end();
							return;
						}

						// Special exception: image/webp (instead of application/octet-stream)
						if(url.substr(-5) === ".webp")
							mimeType = "image/webp";

						// Cache headers
						headers["Content-Type"] = mimeType;

						// Send file
						response.writeHead(200, headers);

						// To cache or not to cache, that is the question!
						if(mimeType.indexOf("image/") !== -1 && stats.size <= staticFileSizeCachingThreshold) {
							fs.readFile(url, function(readError, data) {
								if(readError) {
									console.error(readError);
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
				});
			}
		});
	}
};

module.exports = aero;