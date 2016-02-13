let fs = Promise.promisifyAll(require('fs'))
const outdatedCacheMessage = 'Ignoring cache from an old Aero version'

module.exports = function*() {
	try {
		this.cache = JSON.parse(yield fs.readFileAsync(this.cacheFile, 'utf8'))

		if(this.cache.version !== this.version)
			throw new Error(outdatedCacheMessage)
	} catch(error) {
		if(error.message !== outdatedCacheMessage && (error.code !== 'ENOENT' || error.path !== this.cacheFile))
			this.log(error)

		this.cache = {
			version: this.version,
			fonts: {},
			scripts: {},
			styles: {}
		}
	}
}