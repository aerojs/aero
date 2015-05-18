// Modules
let fs = require("fs");
let path = require("path");
let async = require("async");
let merge = require("object-assign");
let watch = require("node-watch");

// Helpers
let getFile = require("./helpers/getFile");

// Classes
let Page = require("./classes/Page");
let Server = require("./classes/Server");
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
			package: function(callBack) {
				let defaultConfig = require("../default/config");
				
				getFile(configPath, defaultConfig, function(json) {
					callBack(null, JSON.parse(json));
				});
			},
			
			// server
			server: function(callBack) {
				callBack(null, new Server());
			}
		}, function(error, data) {
			if(error)
				throw error;
			
			// Merge fields with main aero object
			aero = merge(aero, data);
			
			// Set config to the data in the "aero" field
			aero.config = data.package.aero;
			
			// Let the world know that we're ready
			aero.events.emit("initialized", aero.config);
			
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
		// Load favicon
		this.events.on("initialized", function(config) {
			fs.readFile(config.favIcon, function(error, data) {
				if(error)
					return;
				
				aero.server.favIconData = data;
			});
		});
		
		// Routes
		this.events.on("initialized", function() {
			fs.readdir(aero.config.path.pages, function(error, files) {
				if(error)
					throw error;
				
				for(let id of files) {
					aero.loadPage(id);
				}
			});
		});
		
		// Launch the server
		this.events.on("initialized", function(config) {
			aero.server.run(config.port, function(error) {
				if(error)
					throw error;
				
				aero.events.emit("server started", aero.server);
			});
		});
		
		// Page modifications
		this.events.on("page modified", function(pageId) {
			console.log("Recompiling page: " + pageId);
			aero.loadPage(pageId);
		});
	},
	
	// loadPage
	loadPage: function(pageId) {
		let page = new Page(pageId, path.join(aero.config.path.pages, pageId));
		
		aero.pages.set(pageId, page);
		aero.server.routes.set(page.id, page.controller.get);
	}
};

module.exports = aero;