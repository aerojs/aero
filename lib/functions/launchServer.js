'use strict'

let chalk = require('chalk')
let Promise = require('bluebird')

// launchServer
let launchServer = Promise.promisify(function(aero, callback) {
	aero.server.run(aero.config.ports.http, aero.config.ports.https, aero.security, function(error) {
		if(error)
			throw error

		aero.serverStarted = true

		if(aero.verbose) {
			console.log(chalk.green(`Server started on ${aero.server.protocol}://localhost:${aero.server.port}.`))
			aero.separator()
		}

		aero.events.emit('server started', aero.server)

		if(callback)
			callback()
	})
})

module.exports = launchServer