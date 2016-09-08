module.exports = function(pageId) {
	Object.keys(this.server.routes).forEach(method => {
		let routes = this.server.routes[method]
		let raw = this.server.raw[method]

		if(!(pageId in routes))
			return

		console.log(`Deleting ${method} route:`, this.chalk.blue(pageId))

		delete routes[pageId]
		delete raw[pageId]
	})
}