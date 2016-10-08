let WebSocket = require('ws')
let UglifyJS = require('uglify-js-harmony')
let chalk = require('chalk')

class LiveReload {
	constructor(app) {
		if(app.security && app.security.key && app.security.cert) {
			this.http = require('spdy').createServer(app.security, () => null)
			this.protocol = 'wss'
		} else {
			this.http = require('http').createServer(() => null)
			this.protocol = 'ws'
		}

		this.port = app.config.ports.liveReload

		// Script for each page in dev mode
		let scriptPath = require.resolve('./client.js')
		this.script = UglifyJS.minify(scriptPath, {
			compress: {
				screw_ie8: true
			},
			mangle: {
				screw_ie8: true
			}
		}).code.replace('${protocol}', this.protocol).replace('${port}', this.port)

		// Keep track of sockets to destroy them later
		this.trackConnections(this.http, this)

		// Listen
		this.http.listen(this.port, error => {
			if(error)
				throw error

			this.server = new WebSocket.Server({
				server: this.http
			})
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

		let closeAsync = Promise.promisify(this.http.close, {context: this.http})
		let closeWebSocketAsync = Promise.promisify(this.server.close, {context: this.server})

		return closeWebSocketAsync().then(() => closeAsync())
	}
}

LiveReload.prototype.trackConnections = require('../Server/trackConnections')

module.exports = LiveReload