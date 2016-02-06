let request = Promise.promisifyAll(require('request'))

module.exports = function*() {
	if(this.config.fonts.length === 0)
		return

	if(this.verbose)
		this.loading('fonts', chalk.bold(this.config.fonts.join(', ')))

	this.time('Fonts')
	this.fontsCss = yield request.getAsync('https://fonts.googleapis.com/css?family=' + this.config.fonts.join('|'))
	this.timeEnd('Fonts')
}