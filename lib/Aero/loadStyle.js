let fs = Promise.promisifyAll(require('fs'))
let stylus = require('stylus')
let autoprefixer = require('autoprefixer-stylus')

module.exports = function*(stylePath) {
	try {
		let styleCode = yield fs.readFileAsync(stylePath, 'utf8')
		let style = stylus(styleCode).use(autoprefixer())
		let compileStyle = Promise.promisify(style.set('compress', true).render, {context: style})
		return yield compileStyle()
	} catch(error) {
		if(error.code !== 'ENOENT' || error.path !== stylePath)
			this.log(error)

		return null
	}
}