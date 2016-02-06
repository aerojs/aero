let mkdir = Promise.promisify(require('mkdirp'))

module.exports = function() {
	return Promise.all(Object.keys(this.config.path).map(directory => mkdir(this.path(directory))))
}