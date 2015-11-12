'use strict'

let aero = require('../')
let chalk = require('chalk')
let Promise = require('bluebird')

// launchServer
let launchServer = Promise.promisify(function(aero, callback) {
	aero.server.run(aero.config.port, aero.security, function(error) {
		if(error)
			throw error

		aero.serverStarted = true

		if(aero.verbose) {
			console.log(chalk.green(`Server started on ${aero.server.protocol}://localhost:${aero.config.port}.`))
			aero.separator()
		}

		aero.events.emit('server started', aero.server)

		if(callback)
			callback()
	})
})

module.exports = launchServer