let path = require('path')

module.exports = function(controllerPath) {
	// Delete existing controller from cache
	delete require.cache[controllerPath]

	// Load the js file
	try {
		return Promise.resolve(require(controllerPath))
	} catch(error) {
		if(error.code !== 'MODULE_NOT_FOUND' || error.message.indexOf(controllerPath) === -1) {
			this.log(this.chalk.bold(path.relative(this.root, controllerPath)))
			this.log(error)
		}

		return Promise.resolve(null)
	}
}