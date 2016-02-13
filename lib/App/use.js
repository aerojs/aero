module.exports = function() {
	for(let i = 0; i < arguments.length; i++) {
		this.server.modifiers.push(arguments[i])
	}
}