let extendClass = require('../extendClass')
let Server = require('../Server')

class Aero {
	constructor(root) {
		this.root = root || ''
		this.verbose = true
		this.server = new Server()
	}
}

extendClass(Aero, __dirname)

module.exports = Aero