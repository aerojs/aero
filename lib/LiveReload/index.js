let WebSocket = require('ws')
let UglifyJS = require('uglify-js')

class LiveReload {
	constructor(app) {
		if(app.security && app.security.key && app.security.cert) {
			this.httpServer = require('spdy').createServer(app.security, () => null)
			this.protocol = 'wss'
		} else {
			this.httpServer = require('http').createServer(() => null)
			this.protocol = 'ws'
		}

		// Script for each page in dev mode
		let scriptPath = require.resolve('./client.js')
		this.script = UglifyJS.minify(scriptPath, {
			compress: {
				screw_ie8: true
			},
			mangle: {
				screw_ie8: true
			}
		}).code.replace('${protocol}', this.protocol).replace('${port}', app.config.ports.liveReload)

		// Listen
		this.httpServer.listen(app.config.ports.liveReload, error => {
			if(error)
				throw error

			this.server = new WebSocket.Server({
				server: this.httpServer
			})
		})
	}

	broadcast(data) {
		if(!this.server || !this.server.clients || this.server.clients.length === 0)
			return

		//let clientCount = this.server.clients.length

		//if(data.url)
		//	console.log(`Refreshing ${chalk.blue(data.url)} on ${clientCount} client${clientCount === 1 ? '' : 's'}`)

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

	stop() {
		if(!this.server)
			return Promise.resolve()

		let closeAsync = Promise.promisify(this.httpServer.close, {context: this.httpServer})
		let closeWebSocketAsync = Promise.promisify(this.server.close, {context: this.server})

		return closeWebSocketAsync().then(() => closeAsync())
	}
}

module.exports = LiveReload