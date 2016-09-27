let fs = Promise.promisifyAll(require('fs'))
let path = require('path')

module.exports = function*(file) {
	file = path.resolve(file)

	try {
		if(this.cache) {
			let cached = this.cache.scripts[file]

			if(cached && (yield fs.statAsync(file)).mtime <= new Date(cached.mtime))
				return cached.code
		}

		let source = yield fs.readFileAsync(file, 'utf8')

		if(!path.basename(file).endsWith('.min.js')) {
			for(let modify of this.scripts.modifiers) {
				source = modify(source, file)
			}
		}

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
