// TODO: This needs a complete rewrite
module.exports = function() {
	this.css.forEach(style => {
		if(!style.code) {
			console.log('Style', chalk.magenta(style.id), ' '.repeat(Math.max(this.columns - 8 - 'Error'.length - style.id.length, 0)), chalk.red('Error'))
			return
		}

		let size = (style.code.length / 1024).toFixed(1)
		console.log('Style', chalk.magenta(style.id), ' '.repeat(Math.max(this.columns - 11 - size.length - style.id.length, 0)), size, chalk.dim('KB'))
	})

	let size = (this.css.map(style => style.code ? style.code.length : 0).reduce((a, b) => a + b) / 1024).toFixed(1)
	let title = 'Total ' + chalk.dim('(uncompressed)')
	console.log(title, ' '.repeat(Math.max(this.columns - 5 - chalk.stripColor(title).length - size.length, 0)), size, chalk.dim('KB'))
}