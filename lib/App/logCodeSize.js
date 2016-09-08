// TODO: This needs a complete rewrite
module.exports = function(name, elements, color) {
	if(elements.length === 0)
		return

	// Individual files
	elements.forEach(element => {
		if(element.code === null || element.code === undefined) {
			console.log(color(element.id), ' '.repeat(Math.max(this.columns - 2 - 'Error'.length - element.id.length, 0)), this.chalk.red('Error'))
			return
		}

		let size = (element.code.length / 1024).toFixed(1)
		console.log(color(element.id), ' '.repeat(Math.max(this.columns - 5 - size.length - element.id.length, 0)), color(size), this.chalk.dim('KB'))
	})

	// Total
	let size = (elements.map(element => element.code ? element.code.length : 0).reduce((a, b) => a + b) / 1024).toFixed(1)
	let title = name + ' ' + this.chalk.dim('(uncompressed)')

	console.log(title, ' '.repeat(Math.max(this.columns - 5 - this.chalk.stripColor(title).length - size.length, 0)), size, this.chalk.dim('KB'))
}