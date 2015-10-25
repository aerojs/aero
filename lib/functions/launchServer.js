'use strict'

let chalk = require('chalk')

// launchServer
let launchServer = function(aero) {
	aero.server.run(aero.config.port, aero.security, function(error) {
		if(error)
			throw error

		aero.serverStarted = true

		if(aero.verbose)
			console.log(chalk.green(`Server started on ${aero.server.protocol}://localhost:${aero.config.port}.`))

		aero.events.emit('server started', aero.server)
	})
}

module.exports = launchServer