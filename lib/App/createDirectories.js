let path = require('path')
let chalk = require('chalk')
let fs = Promise.promisifyAll(require('fs'))
let mkdir = Promise.promisify(require('mkdirp'))

let touchFile = function(filePath, contents, encoding) {
	return fs.statAsync(filePath).catch(error => {
		if(error.code !== 'ENOENT') {
			console.error(chalk.red(error))
			return
		}

		return fs.writeFileAsync(filePath, contents, encoding)
	})
}

module.exports = function() {
	return Promise.all(Object.keys(this.config.path).map(directory => mkdir(this.path(directory))))
	.then(() => touchFile(path.join(this.root, this.config.path.security, '.gitignore'), '*', 'utf8'))
}