let makePromises = function(context, flow) {
	return flow.map(obj => {
		if(typeof obj === 'string') {
			let func = context[obj]

			if(!func)
				throw new Error(`Undefined function in flow context: ${obj}`)

			return func.bind(context)()
		} else if(obj.constructor === Array) {
			return Promise.all(makePromises(context, obj))
		} else {
			throw new Error(`Unsupported type in flow definition: ${typeof obj}`)
		}
	})
}

module.exports = function(flow) {
	return Promise.each(makePromises(this, flow))
}