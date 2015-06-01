// launchServer
let launchServer = function(aero) {
	aero.server.run(aero.config.port, aero.security, function(error) {
		if(error)
			throw error;

		aero.events.emit("server started", aero.server);
	});
};

module.exports = launchServer;