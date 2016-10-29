let fs = Promise.promisifyAll(require('fs'))
let mkdir = Promise.promisify(require('mkdirp'))
let path = require('path')

let findPages = Promise.coroutine(function*(rootPath) {
	let dirs =
		fs.readdirAsync(rootPath)
		.map(file => path.join(rootPath, file))
		.filter(file => fs.statAsync(file).then(stat => stat.isDirectory()))

	let subs =
		dirs.map(dir => findPages(dir))

	return (yield dirs).concat(yield subs).reduce((a, b) => a.concat(b), [])
})

module.exports = function*() {
	this.time('Pages')

	// if(this.verbose && !this.ready.isResolved())
	// 	this.separator(this.color.pages)

	let directory = this.path(this.config.path.pages)

	yield Promise.all(
		findPages(directory)
		.map(pagePath => path.relative(directory, pagePath))
		.map(pageId => this.loadPage(pageId))
	)

	// Create default home page if there is no page configured yet
	if(this.pages.size === 0) {
		let homePath = path.join(directory, 'home')
		let homeTemplate = path.join(homePath, 'home.pug')
		let homeJSON = path.join(homePath, 'home.json')

		yield mkdir(homePath)
		.then(() => fs.writeFileAsync(homeTemplate, 'h1 Hello Aero\np Edit this page in ' + homeTemplate, 'utf8'))
		.then(() => fs.writeFileAsync(homeJSON, JSON.stringify({ url: '' }, null, '\t'), 'utf8'))
		.then(() => this.loadPage('home'))
	}

	this.timeEnd('Pages')
	this.events.emit('all pages loaded')
}