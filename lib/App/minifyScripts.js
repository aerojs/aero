const uglifyJS = require('uglify-es')

const uglifyJSOptions = {
	ie8: false
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

module.exports = function() {
	this.scripts.modifiers.push(minify)
}
