let path = require('path')
let fs = require('fs')
let nodeWatch = require('node-watch')

let watch = function(fileName, callback, recursive) {
	nodeWatch(fileName, {
		persistent: false,
		recursive: recursive === undefined ? true : recursive
	}, callback)
}

// Generalized watching function that watches a directory and sends
// the basename of the file (without the extension) to an event.
// Example: 'path/file.ext' becomes 'file'
let watchFlatDirectory = function(directory, fileExtension, callback) {
	return watch(directory, function(filePath) {
		let relativeFilePath = path.relative(directory, filePath)
		let fileId = path.basename(relativeFilePath, fileExtension)

		callback(fileId)
	})
}

module.exports = function() {
	// Watch for config modifications
	watch(this.path('config.json'), () => this.events.emit('config modified'), false)

	// Watch for layout modifications
	watch(this.path(this.config.path.layout), () => this.events.emit('layout modified'))

	// Watch for script and style modifications
	let types = [
		'style',
		'script',
		'startup'
	]

	types.forEach(element => {
		let elements = element + 's'

		watchFlatDirectory(
			this.path(this.config.path[elements] || this.config.path[element]),
			this.fileExtension[elements],
			fileId => this.events.emit(`${element} modified`, fileId)
		)
	})

	// Watch for page modifications
	watch(this.path(this.config.path.pages), filePath => {
		// Distinguish between file and directory paths
		fs.stat(filePath, (error, stats) => {
			let pageId = path.relative(this.path(this.config.path.pages), filePath)

			// If the page was deleted we remove it from 'this.pages' and delete the server route
			if(error && error.code === 'ENOENT') {
				this.pages.delete(pageId)
				this.unroute(pageId)
				return
			}

			if(stats.isFile())
				pageId = path.dirname(pageId)

			this.events.emit('page modified', pageId)
		})
	})
}