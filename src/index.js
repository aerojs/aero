// Modules
let fs = require("fs");
let path = require("path");
let async = require("async");
let merge = require("object-assign");

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
		});
	},
	
	// registerEventListeners
	registerEventListeners: function() {
		this.events.on("initialized", function(config) {
			fs.readFile(config.favIcon, function(error, data) {
				if(error)
					return;
				
				aero.server.favIconData = data;
			});
		});
		
		// Routes
		this.events.on("initialized", function() {
			let pagesPath = "pages";
			
			fs.readdir(pagesPath, function(error, files) {
				if(error)
					throw error;
				
				for(let file of files) {
					let page = new Page(file, path.join(pagesPath, file));
					aero.pages.set(file, page);
					aero.server.routes.set(page.id, page.controller.get);
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
	}
};

module.exports = aero;