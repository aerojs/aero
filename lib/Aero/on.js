module.exports = function(eventName, func) {
	this.past.push(() => this.events.on(eventName, func))

	if(this.events)
		this.events.on(eventName, func)
}