let fs = Promise.promisifyAll(require('fs'))

module.exports = function*(file) {
	try {
		let source = yield fs.readFileAsync(file, 'utf8')
		return JSON.parse(source)
	} catch(error) {
		if(error.code !== 'ENOENT' || error.path !== file) {
			this.log(this.chalk.bold(file))
			this.log(error)
		}

		return null
	}
}