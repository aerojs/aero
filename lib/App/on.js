module.exports = function(eventName, func) {
	if(func.constructor.name === 'GeneratorFunction')
		func = Promise.coroutine(func).bind(this)

	this.events.on(eventName, func)
}