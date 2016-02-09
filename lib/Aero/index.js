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
		this.verbose = true
		this.server = new Server()
		this.plugins = {}
		this.benchmarks = {}
		this.pages = new Map()
		this.past = []
		this.version = aeroPackage.version
		this.production = process.env.NODE_ENV === 'production'

		this.color = {
			styles: chalk.magenta,
			scripts: chalk.cyan,
			plugins: chalk.yellow,
			pages: chalk.blue
		}

		this.fileExtension = {
			styles: '.styl',
			scripts: '.js'
		}
	}
}

module.exports = extendClass(Aero, __dirname)