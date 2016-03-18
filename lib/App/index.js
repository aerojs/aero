let path = require('path')
let Server = require('../Server')
let extendClass = require('../extendClass')
let aeroPackage = require('../../package.json')
let marked = require('marked')

// New yield handler
Promise.coroutine.addYieldHandler(function(value) {
	if(Array.isArray(value))
		return Promise.all(value)

	if(typeof value === 'object')
		return Promise.props(value)
})

// Enable GitHub flavored markdown
marked.setOptions({
	gfm: true
})

class App {
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
App.prototype.verbose = true
App.prototype.version = aeroPackage.version
App.prototype.production = process.env.NODE_ENV === 'production'
App.prototype.fileExtension = {
	styles: '.styl',
	scripts: '.js'
}
App.prototype.color = {
	styles: chalk.magenta,
	scripts: chalk.cyan,
	plugins: chalk.yellow,
	pages: chalk.blue
}
App.prototype.cacheFile = path.join(__dirname, '../../cache/cache.json')
App.prototype.markdown = marked

module.exports = extendClass(App, __dirname)