let async = require("async");
let merge = require("object-assign");
//let Page = require("./classes/Page");
let Server = require("./classes/Server");
let getFile = require("./helpers/getFile");
let EventEmitter = require("./classes/EventEmitter");

let aero = {
	events: new EventEmitter(),
	
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
		// Launch the server when we have the port info
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