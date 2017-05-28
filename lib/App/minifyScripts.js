const uglifyJS = require('uglify-es')

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

module.exports = function() {
	this.scripts.modifiers.push(minify)
}