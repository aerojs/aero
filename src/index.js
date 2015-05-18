let async = require("async");
//let Page = require("./classes/Page");
let Server = require("./classes/Server");
let getFile = require("./helpers/getFile");
let EventEmitter = require("./classes/EventEmitter");

let aero = {
	events: new EventEmitter(),
	error: console.error,
	
	// run
	run: function(configPath) {
		configPath = configPath || "package.json";
		
		async.parallel({
			// config
			config: function(callBack) {
				let defaultConfig = require("../default/config");
				
				getFile(configPath, defaultConfig, function(json) {
					callBack(null, JSON.parse(json));
				});
			},
			
			// server
			server: function(callBack) {
				callBack(null, new Server());
			},
			
			// events
			events: function(callBack) {
				callBack(null, new EventEmitter());
			}
		}, function(error, data) {
			if(error)
				throw error;
			
			aero.events.emit("initialized", data.config);
		});
	}
};

module.exports = aero;