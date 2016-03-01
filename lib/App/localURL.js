module.exports = function(path) {
	return `${this.server.protocol}://localhost:${this.server.port}/${path}`
}