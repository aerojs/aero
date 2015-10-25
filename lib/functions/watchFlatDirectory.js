'use strict'

let path = require('path')
let watch = require('node-watch')

// Generalized watching function that watches a directory and sends
// the basename of the file (without the extension) to an event.
// Example: 'path/file.ext' becomes 'file'
let watchFlatDirectory = function(directory, fileExtension, eventEmitter, eventName) {
	watch(directory, function(filePath) {
		let relativeFilePath = path.relative(directory, filePath)
		let fileId = path.basename(relativeFilePath, fileExtension)

		eventEmitter.emit(eventName, fileId)
	})
}

module.exports = watchFlatDirectory