let path = require('path')
let Server = require('../Server')
let extendClass = require('../extendClass')
let aeroPackage = require('../../package.json')
let Remarkable = require('remarkable')
let md = new Remarkable()

// New yield handler
Promise.coroutine.addYieldHandler(function(value) {
	if(Array.isArray(value))
		return Promise.all(value)

	if(typeof value === 'object')
		return Promise.props(value)
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
	scripts: '.js',
	startups: '.js'
}
App.prototype.color = {
	styles: chalk.magenta,
	scripts: chalk.cyan,
	plugins: chalk.yellow,
	pages: chalk.blue
}
App.prototype.cacheFile = path.join(__dirname, '../../cache/cache.json')
App.prototype.markdown = markdown => md.render(markdown)

let median = function(values) {
	values.sort((a, b) => a - b)

	let half = Math.floor(values.length / 2)

	if(values.length % 2)
	    return values[half]
	else
	    return (values[half - 1] + values[half]) / 2.0
}

let getPagesAverageFunction = function(property) {
	return function() {
		let pages = Array.from(this.pages.values())
		pages = pages.filter(page => page[property] !== undefined)

		if(pages.length === 0)
			return 0

		return median(pages.map(page => page[property]))
		//return pages.map(page => page[property]).reduce((a, b) => a + b) / pages.length
	}
}

Object.defineProperty(App.prototype, 'averageResponseTime', {
	get: getPagesAverageFunction('responseTime')
})

Object.defineProperty(App.prototype, 'averageCodeSize', {
	get: getPagesAverageFunction('codeSize')
})

module.exports = extendClass(App, __dirname)