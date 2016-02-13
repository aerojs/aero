module.exports = function() {
	return this.server.run(this.config, this.security)
	.then(() => this.events.emit('server started'))
}