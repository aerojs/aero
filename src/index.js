// Modules
let path = require("path");
let watch = require("node-watch");

// Functions
let getFile = require("./functions/getFile");
let loadFavIcon = require("./functions/loadFavIcon");
let loadPages = require("./functions/loadPages");
let launchServer = require("./functions/launchServer");

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
	liveReload: new LiveReload(),

	// run
	run: function(configPath) {
		configPath = configPath || "package.json";

		// Register event listeners
		this.registerEventListeners();

		// Load default aero configuration
		let defaultConfig = require("../default/config");

		// Load aero config from package.json
		getFile(configPath, defaultConfig, function(json) {
			aero.package = JSON.parse(json);

			// Set config to the data in the "aero" field
			aero.config = aero.package.aero;

			// Let the world know that we're ready
			aero.events.emit("initialized", aero);

			// Watch for page modifications
			watch(aero.config.path.pages, function(filePath) {
				let relativeFilePath = path.relative(aero.config.path.pages, filePath);
				let pageId = path.dirname(relativeFilePath);

				aero.events.emit("page modified", pageId);
			});

			// Watch for layout modifications
			watch(aero.config.path.layout, function() {
				aero.events.emit("layout modified");
			});
		});
	},

	// registerEventListeners
	registerEventListeners: function() {
		this.events.on("initialized", function() {
			loadFavIcon(aero.config.favIcon, function(imageData) {
				aero.server.favIconData = imageData;
			});

			// Layout
			aero.layout = new Layout(aero.config.path.layout);

			// Pages
			loadPages(aero.config.path.pages, aero.loadPage);

			// Launch the server
			launchServer(aero);
		});

		// Page modifications
		this.events.on("page modified", function(pageId) {
			aero.loadPage(pageId);
			aero.liveReload.server.broadcast(pageId);
		});

		// Layout modifications
		this.events.on("layout modified", function() {
			aero.layout = new Layout(aero.config.path.layout);
			
			for(let page of aero.pages.values()) {
				if(!page.controller || page.controller.render)
					aero.events.emit("page loaded", page);
			}
		});

		// Page loaded
		this.events.on("page loaded", function(page) {
			// Register a raw route
			aero.pages.set(page.id, page);

			if(page.controller) {
				aero.server.raw.set(page.url, page.controller.get.bind(page.controller));
			} else {
				aero.server.raw.set(page.url, function(request, response) {
					response.end(page.code);
				});
			}
			
			let renderLayoutTemplate = aero.layout.renderTemplate;
			let contentType = {
				"Content-Type": "text/html"
			};

			// Routing
			if(page.controller && page.controller.render) {
				let renderPageTemplate = page.renderTemplate;
				let renderPage = page.controller.render;
				
				if(aero.layout.controller) {
					let renderLayout = aero.layout.controller.render.bind(aero.layout.controller);

					// Dynamic layout + Dynamic page
					aero.server.routes.set(page.url, function(request, response) {
						response.writeHead(200, contentType);

						renderLayout(request, function(layoutControllerParams) {
							renderPage(request, function(params) {
								let code = renderPageTemplate(params);

								if(layoutControllerParams) {
									layoutControllerParams.content = code;
									response.end(renderLayoutTemplate(layoutControllerParams));
								} else {
									response.end(renderLayoutTemplate({
										content: code
									}));
								}
							});
						});
					});
				} else {
					// Static layout + Dynamic page
					aero.server.routes.set(page.url, function(request, response) {
						response.writeHead(200, contentType);

						renderPage(request, function(params) {
							response.end(renderLayoutTemplate({
								content: renderPageTemplate(params)
							}));
						});
					});
				}
			} else {
				if(page.controller) {
					// Completely user-controlled dynamic page (e.g. API calls)
					aero.server.routes.set(page.url, page.controller.get.bind(page.controller));
				} else if(aero.layout.controller) {
					let renderLayout = aero.layout.controller.render.bind(aero.layout.controller);
					
					// Dynamic layout + Static page
					aero.server.routes.set(page.url, function(request, response) {
						response.writeHead(200, contentType);
						
						renderLayout(request, function(layoutControllerParams) {
							layoutControllerParams.content = page.code;
							response.end(renderLayoutTemplate(layoutControllerParams));
						});
					});
				} else {
					// Static layout + Static page
					let staticPageCode = renderLayoutTemplate({
						content: page.code
					});
					
					aero.server.routes.set(page.url, function(request, response) {
						response.writeHead(200, contentType);
						response.end(staticPageCode);
					});
				}
			}
		});
	},

	// loadPage
	loadPage: function(pageId) {
		return new Page(pageId, path.join(aero.config.path.pages, pageId), function(page) {
			aero.events.emit("page loaded", page);
		});
	},

	// get
	get: function() {
		// Not implemented yet
	}
};

module.exports = aero;