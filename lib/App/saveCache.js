let fs = Promise.promisifyAll(require('fs'))

module.exports = function() {
	if(!this.cache)
		return Promise.resolve()

	return fs.writeFileAsync(this.cacheFile, JSON.stringify(this.cache), 'utf8')
	.catch(error => this.log(error))
}