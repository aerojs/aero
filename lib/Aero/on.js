module.exports = function(eventName, func) {
	if(func.constructor.name === 'GeneratorFunction')
		func = Promise.coroutine(func).bind(this)

	this.past.push(() => this.events.on(eventName, func))

	if(this.events)
		this.events.on(eventName, func)
}