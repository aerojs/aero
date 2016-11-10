// This is executed in production environments to lower the RAM usage.
// When using Aero as a development server the cache should not be deleted.

module.exports = function() {
	if(!this.production)
		return

	this.cache = null

	if(!global.gc) {
		this.separator()
		console.warn(this.chalk.yellow('Please start node with --expose-gc to significantly lower Aero\'s RAM usage.'))
		return
	}

	global.gc()
}