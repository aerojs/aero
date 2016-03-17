let fs = Promise.promisifyAll(require('fs'))

module.exports = function*(file) {
	try {
		return yield fs.readFileAsync(file, 'utf8')
	} catch(error) {
		if(error.code !== 'ENOENT' || error.path !== file)
			this.log(error)

		return null
	}
}