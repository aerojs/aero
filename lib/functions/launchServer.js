'use strict';

// launchServer
let launchServer = function(aero) {
	aero.server.run(aero.config.port, aero.security, function(error) {
		if(error)
			throw error;

		console.log(`Server started on ${aero.server.protocol}://localhost:${aero.config.port}.`);
		aero.events.emit('server started', aero.server);
	});
};

module.exports = launchServer;