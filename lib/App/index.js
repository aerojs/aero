let path = require('path')
let chalk = require('chalk')
let Server = require('../Server')
let Linter = require('../Linter')
let MarkdownIt = require('markdown-it')
let loadClass = require('../loadClass')
let aeroPackage = require('../../package.json')

class App {
	constructor(root) {
		this.root = root || ''
		this.path = file => path.join(this.root, file)
		this.server = new Server()
		this.linter = new Linter()
		this.plugins = {}
		this.benchmarks = {}
		this.pages = new Map()
		this.past = []
		this.scripts = {
			modifiers: []
		}
	}
}

// Prototype (app instance independent members)
let initPrototype = function() {
	App.prototype.verbose = true
	App.prototype.version = aeroPackage.version
	App.prototype.production = process.env.NODE_ENV === 'production'
	App.prototype.cacheFile = path.join(__dirname, '../../cache/cache.json')
	App.prototype.chalk = chalk
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
}

// Markdown
let initMarkdown = function() {
	const md = new MarkdownIt()
	App.prototype.markdown = markdown => md.render(markdown)
}

// Computed properties
let initComputedProperties = function() {
	Object.defineProperty(App.prototype, 'averageResponseTime', { get: getAverage('responseTime') })
	Object.defineProperty(App.prototype, 'averageResponseSize', { get: getAverage('responseSize') })
	Object.defineProperty(App.prototype, 'stylesSize', { get: getCodeSize('css') })
	Object.defineProperty(App.prototype, 'scriptsSize', { get: getCodeSize('js') })
}

// Yield handlers
let initYieldHandlers = function() {
	Promise.coroutine.addYieldHandler(function(value) {
		if(Array.isArray(value))
			return Promise.all(value)

		if(typeof value === 'object')
			return Promise.props(value)
	})
}

// Median: [1, 3, 3, 6, 7, 8, 9] returns 6
let median = function(values) {
	values.sort((a, b) => a - b)

	let half = Math.floor(values.length / 2)

	if(values.length % 2)
		return values[half]
	else
		return (values[half - 1] + values[half]) / 2.0
}

// Get median average for a numeric page property
let getAverage = function(property) {
	return function() {
		let pages = Array.from(this.pages.values())
		pages = pages.filter(page => page[property] !== undefined)

		if(pages.length === 0)
			return 0

		return median(pages.map(page => page[property]))
		//return pages.map(page => page[property]).reduce((a, b) => a + b) / pages.length
	}
}

// Get code size
let getCodeSize = function(property) {
	return function() {
		return this[property].map(element => element.code ? element.code.length : 0).reduce((a, b) => a + b, 0)
	}
}

// Init
initPrototype()
initMarkdown()
initComputedProperties()
initYieldHandlers()

// Export App class
module.exports = loadClass(App, __dirname)