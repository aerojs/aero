let LiveReload = require('../LiveReload')

module.exports = function() {
	if(this.production)
		return

	this.liveReload = new LiveReload(this)
}