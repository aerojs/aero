module.exports = function() {
	return this.server.run(this)
	.then(() => this.events.emit('server started'))
}