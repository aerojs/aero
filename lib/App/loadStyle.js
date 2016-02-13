let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let stylus = require('stylus')
let autoprefixer = require('autoprefixer-stylus')

module.exports = function*(file) {
	file = path.resolve(file)

	try {
		let cached = this.cache.styles[file]

		if(cached)
			return cached.code

		let styleCode = yield fs.readFileAsync(file, 'utf8')

		if(this.globalStyle)
			styleCode = this.globalStyle + styleCode

		let style = stylus(styleCode)
		style.use(autoprefixer())
		style.set('compress', true)

		let render = Promise.promisify(style.render, {context: style})
		let code = yield render()

		// Cache it
		this.cache.styles[file] = {
			code,
			lastModified: (new Date()).toISOString()
		}

		return code
	} catch(error) {
		//console.log(error.stack)
		if(error.code !== 'ENOENT' || error.path !== file)
			this.log(error)

		return null
	}
}