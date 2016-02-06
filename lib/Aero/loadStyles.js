let fs = Promise.promisifyAll(require('fs'))
let path = require('path')

// We load all files in the styles directory but
// we want to prioritize the loading order specified
// in the config.styles array. Files that have no
// defined loading order are placed at the end.
let sortByLoadingOrder = function(a, b) {
	if(a.order === b.order)
		return 0

	if(a.order === -1)
		return 1

	if(b.order === -1)
		return -1

	return a.order - b.order
}

module.exports = function*() {
	this.time('Styles')
	this.separator(chalk.magenta)

	this.css = yield fs.readdirAsync(this.path(this.config.path.styles))
	.map(file => {
		let styleId = file.replace(/\.[^/.]+$/, '')

		return {
			id: styleId,
			code: '',
			order: this.config.styles.indexOf(styleId)
		}
	})
	.then(styles => styles.sort(sortByLoadingOrder))
	.map(style => {
		if(this.verbose)
			this.loading('style', chalk.magenta(style.id))

		let stylePath = path.join(this.root, this.config.path.styles, style.id + '.styl')

		return this.loadStyle(stylePath).then(code => {
			style.code = code
			this.events.emit('style loaded', style)
			return style
		})
	})

	console.log(this.css.length)

	this.events.emit('all styles loaded')
	this.timeEnd('Styles')
}