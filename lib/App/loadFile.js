let fs = Promise.promisifyAll(require('fs'))

module.exports = function*(filePath, fallback, options) {
	options = options || {}
	options.encoding = options.encoding || 'utf8'
	options.writeDefault = (options.writeDefault !== undefined) ? writeDefault : true

	if(typeof fallback === 'object')
		fallback = JSON.stringify(fallback, null, '\t')

	try {
		return yield fs.readFileAsync(filePath, options.encoding)
	} catch(error) {
		if(error.code === 'ENOENT') {
			if(options.writeDefault) {
				fs.writeFileAsync(filePath, fallback, options.encoding)
				.catch(e => this.log(e))
			}
		} else {
			this.log(error)
		}

		return fallback
	}
}