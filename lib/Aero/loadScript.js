let fs = Promise.promisifyAll(require('fs'))

module.exports = function*(file) {
	try {
		let source = yield fs.readFileAsync(file, 'utf8')

		return source
	} catch(e) {
		if(e.code !== 'ENOENT' || e.path !== file)
			this.log(e)

		return null
	}
}