const uglifyJS = require('uglify-es')

const uglifyJSOptions = {
	toplevel: true,
	ie8: false
}

let minify = function(source, file) {
	// Minify
	source = uglifyJS.minify({
		[file]: source
	}, uglifyJSOptions).code

	return source
}

module.exports = function() {
	this.scripts.modifiers.push(minify)
}