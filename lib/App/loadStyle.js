let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let stylus = require('stylus')
let autoprefixer = require('autoprefixer-stylus')

module.exports = function*(file) {
	file = path.resolve(file)

	try {
		if(this.cache) {
			let cached = this.cache.styles[file]

			if(cached && (yield fs.statAsync(file)).mtime <= new Date(cached.mtime))
				return cached.code
		}

		let styleCode = yield fs.readFileAsync(file, 'utf8')

		if(this.globalStyle)
			styleCode = this.globalStyle + '\n' + styleCode

		let style = stylus(styleCode)
		style.use(autoprefixer())
		style.set('compress', true)

		let render = Promise.promisify(style.render, {context: style})
		let code = yield render()

		// Cache it
		if(this.cache) {
			this.cache.styles[file] = {
				code,
				lastModified: (new Date()).toISOString()
			}
		}

		return code
	} catch(error) {
		if(error.code !== 'ENOENT' || error.path !== file)
			this.log(error)

		return null
	}
}