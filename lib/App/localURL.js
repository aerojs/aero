module.exports = function(path) {
	if(path.startsWith('/'))
		path = path.substring(1)
	
	return `${this.server.protocol}://localhost:${this.server.port}/${path}`
}