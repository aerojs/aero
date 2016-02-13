let fs = Promise.promisifyAll(require('fs'))

module.exports = function() {
	return fs.writeFileAsync(this.cacheFile, JSON.stringify(this.cache), 'utf8')
	.catch(error => this.log(error))
}