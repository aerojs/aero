const fs = Promise.promisifyAll(require('fs'))

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
				fs.writeFileSync(filePath, fallback, options.encoding)
			}
		} else {
			this.log(error)
		}

		return fallback
	}
}
