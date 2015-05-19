// Modules
let path = require("path");
let async = require("async");
let merge = require("object-assign");
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
	
	// run
	run: function(configPath) {
		configPath = configPath || "package.json";
		
		// Register event listeners
		this.registerEventListeners();
		
		// Parallely load some stuff
		async.parallel({
			// package
			package: function(asyncReturn) {
				let defaultConfig = require("../default/config");
				
				getFile(configPath, defaultConfig, function(json) {
					asyncReturn(null, JSON.parse(json));
				});
			},
			
			// server
			server: function(asyncReturn) {
				asyncReturn(null, new Server());
			},
			
			liveReload: function(asyncReturn) {
				asyncReturn(null, new LiveReload());
			}
		}, function(error, data) {
			if(error)
				throw error;
			
			// Merge fields with main aero object
			aero = merge(aero, data);
			
			// Set config to the data in the "aero" field
			aero.config = data.package.aero;
			
			// Let the world know that we're ready
			aero.events.emit("initialized", aero);
			
			// Watch for changes
			watch(aero.config.path.pages, function(filePath) {
				let relativeFilePath = path.relative(aero.config.path.pages, filePath);
				let pageId = path.dirname(relativeFilePath);
				
				aero.events.emit("page modified", pageId);
			});
		});
	},
	
	// registerEventListeners
	registerEventListeners: function() {
		this.events.on("initialized", function() {
			async.parallel({
				favIconData: function(next) {
					loadFavIcon(aero.config.favIcon, next);
				},
				layout: function(next) {
					next(null, new Layout("layout"));
				},
				pages: function(next) {
					loadPages(aero.config.path.pages, aero.loadPage, next);
				}
			}, function(error, results) {
				if(error)
					throw error;
				
				aero.server.favIconData = results.favIconData;
				
				// Launch the server
				launchServer(aero);
			});
		});
		
		// Page modifications
		this.events.on("page modified", function(pageId) {
			console.log("Recompiling page: " + pageId);
			async.parallel([function(next) {
				aero.loadPage(pageId, next);
			}], function() {
				aero.liveReload.server.broadcast(pageId);
			});
		});
		
		// Page loaded
		this.events.on("page loaded", function(page) {
			// Register a new route
			aero.pages.set(page.id, page);
			aero.server.routes.set(page.url, page.controller.get.bind(page.controller));
		});
	},
	
	// loadPage
	loadPage: function(pageId, next) {
		next(null, new Page(pageId, path.join(aero.config.path.pages, pageId), function(page) {
			aero.events.emit("page loaded", page);
		}));
	}
};

module.exports = aero;