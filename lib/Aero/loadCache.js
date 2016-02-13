let fs = Promise.promisifyAll(require('fs'))

module.exports = function*() {
	try {
		this.cache = JSON.parse(yield fs.readFileAsync(this.cacheFile, 'utf8'))
	} catch(error) {
		this.cache = {
			scripts: {},
			styles: {}
		}
	}
}