let fs = Promise.promisifyAll(require('fs'))

module.exports = function*() {
	try {
		this.cache = JSON.parse(yield fs.readFileAsync(this.cacheFile, 'utf8'))

		if(this.cache.version !== this.version)
			throw new Error('Ignoring cache from an old Aero version')
	} catch(error) {
		if(error.code !== 'ENOENT' || error.path !== this.cacheFile)
			this.log(error)

		this.cache = {
			version: this.version,
			fonts: {},
			scripts: {},
			styles: {}
		}
	}
}