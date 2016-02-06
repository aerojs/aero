let fs = require('fs')
let Server = require('../Server')
let extendClass = require('../extendClass')

class Aero {
	constructor(root) {
		this.root = root || ''
		this.verbose = true
		this.server = new Server()
	}
}

extendClass(Aero, __dirname)

module.exports = Aero