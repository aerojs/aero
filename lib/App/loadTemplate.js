let fs = Promise.promisifyAll(require('fs'))
let pug = require('pug')

module.exports = function*(file) {
	try {
		let source = yield fs.readFileAsync(file, 'utf8')

		return pug.compile(source, {
			filename: file
		})
	} catch(error) {
		if(error.code !== 'ENOENT' || error.path !== file) {
			this.log(error)

			// Return a function that renders the error
			let render = () => error.toString()
			render.isError = true

			return render
		}

		return null
	}
}