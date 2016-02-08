let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let babel = require('babel-core')
let uglifyJS = require('uglify-js')

const uglifyJSOptions = {
	fromString: true,
	compress: {
		screw_ie8: true
	},
	mangle: {
		screw_ie8: true
	}
}

const babelOptions = {
	plugins: [
		require("babel-plugin-transform-es2015-template-literals"),
		require("babel-plugin-transform-es2015-literals"),
		require("babel-plugin-transform-es2015-function-name"),
		require("babel-plugin-transform-es2015-arrow-functions"),
		require("babel-plugin-transform-es2015-block-scoped-functions"),
		require("babel-plugin-transform-es2015-classes"),
		require("babel-plugin-transform-es2015-object-super"),
		require("babel-plugin-transform-es2015-shorthand-properties"),
		require("babel-plugin-transform-es2015-computed-properties"),
		require("babel-plugin-transform-es2015-for-of"),
		require("babel-plugin-transform-es2015-sticky-regex"),
		require("babel-plugin-transform-es2015-unicode-regex"),
		require("babel-plugin-check-es2015-constants"),
		require("babel-plugin-transform-es2015-spread"),
		require("babel-plugin-transform-es2015-parameters"),
		require("babel-plugin-transform-es2015-destructuring"),
		require("babel-plugin-transform-es2015-block-scoping")
	]
}

let minify = function(source, file) {
	// Translate ES 2015 to standard JavaScript
	source = babel.transform(source, Object.assign({
		filename: file
	}, babelOptions)).code

	// Minify
	source = uglifyJS.minify(source, Object.assign({
		parse: {
			filename: file
		}
	}, uglifyJSOptions)).code

	return source
}

module.exports = function*(file) {
	try {
		let source = yield fs.readFileAsync(file, 'utf8')

		if(!path.basename(file).endsWith('.min.js'))
			source = minify(source, file)

		return source
	} catch(e) {
		if(e.code !== 'ENOENT' || e.path !== file)
			this.log(e)

		return null
	}
}