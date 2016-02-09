module.exports = function(method, url, func) {
	// RegEx
	if(url instanceof RegExp) {
		this.server.regexRoutes[method].add({
			regEx: url,
			route: func
		})
		return
	}

	// Remove starting slash
	if(url.startsWith('/'))
		url = url.substr(1)

	// Remove ending slash
	if(url.endsWith('/'))
		url = url.slice(0, -1)

	// Save route
	this.server.routes[method][url] = func

	if(this.events)
		this.events.emit('route modified', method, url)
}