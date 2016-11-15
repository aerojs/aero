const WebSocket = require('uws')
const UglifyJS = require('uglify-js-harmony')
const chalk = require('chalk')
const scriptPath = require.resolve('./reload.client.js')

class LiveReload {
	constructor(app) {
		if(app.security && app.security.key && app.security.cert) {
			this.http = require('spdy').createServer(app.security, () => null)
			this.protocol = 'wss'
		} else {
			this.http = require('http').createServer(() => null)
			this.protocol = 'ws'
		}

		this.port = 45032

		this.scriptCode = UglifyJS.minify(scriptPath, {
			compress: {
				screw_ie8: true
			},
			mangle: {
				screw_ie8: true
			}
		}).code.replace('${protocol}', this.protocol)

		// Keep track of sockets to destroy them later
		this.trackConnections(this.http, this)

		// Automatically find an open port when listening fails
		this.http.on('error', error => {
			this.findPort()
		})

		// Listen
		this.findPort()
	}

	findPort() {
		this.port += 1

		// Listen
		this.http.listen(this.port, error => {
			if(error)
				throw error

			this.server = new WebSocket.Server({
				server: this.http
			})

			this.script = this.scriptCode.replace('${port}', this.port)
		})
	}

	broadcast(data) {
		if(!this.server || !this.server.clients || this.server.clients.length === 0)
			return

		//let clientCount = this.server.clients.length

		//if(data.url)
		//	console.log(`Refreshing ${this.chalk.blue(data.url)} on ${clientCount} client${clientCount === 1 ? '' : 's'}`)

		// Broadcast data to all clients
		const dataString = JSON.stringify(data)

		this.server.clients.forEach(client => {
			if(client.readyState !== WebSocket.OPEN)
				return

			try {
				client.send(dataString)
			} catch(error) {
				console.error(chalk.bold('LiveReload error: Sending data to a client...'))
				console.error(chalk.red(error))
			}
		})
	}

	reload() {
		this.broadcast({
			title: 'reload'
		})
	}

	stop() {
		if(!this.server)
			return Promise.resolve()

		this.http.closeSockets()

		let close = Promise.promisify(this.http.close, {context: this.http})
		return close()
	}
}

LiveReload.prototype.trackConnections = require('../Server/trackConnections')

module.exports = LiveReload