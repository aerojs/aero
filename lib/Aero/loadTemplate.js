let fs = Promise.promisifyAll(require('fs'))
let jade = require('jade')

module.exports = function*(file) {
	try {
		let source = yield fs.readFileAsync(file, 'utf8')

		return jade.compile(source, {
			filename: file
		})
	} catch(e) {
		if(e.code !== 'ENOENT' || e.path !== file)
			this.log(e)

		return null
	}
}