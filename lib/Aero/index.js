let fs = require('fs')
let path = require('path')
let Server = require('../Server')
let extendClass = require('../extendClass')
let aeroPackage = require('../../package.json')

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
		this.path = file => path.join(this.root, file)
		this.server = new Server()
		this.plugins = {}
		this.benchmarks = {}
		this.pages = new Map()
		this.past = []
	}
}

// Value type, instance independent members
Aero.prototype.verbose = true
Aero.prototype.version = aeroPackage.version
Aero.prototype.production = process.env.NODE_ENV === 'production'
Aero.prototype.fileExtension = {
	styles: '.styl',
	scripts: '.js'
}
Aero.prototype.color = {
	styles: chalk.magenta,
	scripts: chalk.cyan,
	plugins: chalk.yellow,
	pages: chalk.blue
}
Aero.prototype.cacheFile = path.join(__dirname, '../../cache.json')

module.exports = extendClass(Aero, __dirname)