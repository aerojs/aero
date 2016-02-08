let fs = Promise.promisifyAll(require('fs'))
let stylus = require('stylus')
let autoprefixer = require('autoprefixer-stylus')

module.exports = function*(stylePath) {
	try {
		let styleCode = yield fs.readFileAsync(stylePath, 'utf8')

		let style = stylus(styleCode)
		style.use(autoprefixer())
		style.set('compress', true)

		let render = Promise.promisify(style.render, {context: style})
		return yield render()
	} catch(error) {
		//console.log(error.stack)
		if(error.code !== 'ENOENT' || error.path !== stylePath)
			this.log(error)

		return null
	}
}