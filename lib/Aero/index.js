let fs = require('fs')
let Server = require('../Server')
let extendClass = require('../extendClass')

// New yield handler
Promise.coroutine.addYieldHandler(function(value) {
	if(Array.isArray(value))
		return Promise.all(value)

	if(typeof value === 'object')
		return Promise.props(value)
})

// Aero
class Aero {
	constructor(root) {
		this.root = root || ''
		this.verbose = true
		this.server = new Server()
	}
}

extendClass(Aero, __dirname)

module.exports = Aero