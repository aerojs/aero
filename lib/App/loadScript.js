let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let uglifyJS = require('uglify-js-harmony')

const uglifyJSOptions = {
	fromString: true,
	compress: {
		screw_ie8: true
	},
	mangle: {
		screw_ie8: true
	}
}

let minify = function(source, file) {
	// Minify
	source = uglifyJS.minify(source, Object.assign({
		parse: {
			filename: file
		}
	}, uglifyJSOptions)).code

	return source
}

module.exports = function*(file) {
	file = path.resolve(file)

	try {
		if(this.cache) {
			let cached = this.cache.scripts[file]

			if(cached && (yield fs.statAsync(file)).mtime <= new Date(cached.mtime))
				return cached.code
		}

		let source = yield fs.readFileAsync(file, 'utf8')

		if(!path.basename(file).endsWith('.min.js'))
			source = minify(source, file)

		// Cache it
		if(this.cache) {
			this.cache.scripts[file] = {
				code: source,
				mtime: (new Date()).toISOString()
			}
		}

		return source
	} catch(e) {
		if(e.code !== 'ENOENT' || e.path !== file)
			this.log(e)

		return null
	}
}
