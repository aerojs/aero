let path = require('path')
let watch = require('node-watch')

// Generalized watching function that watches a directory and sends
// the basename of the file (without the extension) to an event.
// Example: 'path/file.ext' becomes 'file'
let watchFlatDirectory = function(directory, fileExtension, callback) {
	watch(directory, function(filePath) {
		let relativeFilePath = path.relative(directory, filePath)
		let fileId = path.basename(relativeFilePath, fileExtension)

		callback(fileId)
	})
}

module.exports = function() {
	// Watch for config modifications
	watch(this.path('config.json'), () => this.events.emit('config modified'))

	// Watch for layout modifications
	watch(this.path(this.config.path.layout), () => this.events.emit('layout modified'))

	// Watch for script and style modifications
	let types = [
		'style',
		'script'
	]

	types.forEach(element => {
		let elements = element + 's'

		watchFlatDirectory(
			this.path(this.config.path[elements]),
			this.fileExtension[elements],
			fileId => this.events.emit(`${element} modified`, fileId)
		)
	})

	// Watch for page modifications
	watch(this.path(this.config.path.pages), filePath => {
		let pageId = path.dirname(path.relative(this.config.path.pages, filePath))

		this.events.emit('page modified', pageId)
	})
}