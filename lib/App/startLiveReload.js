let LiveReload = require('../LiveReload')

module.exports = function() {
	this.liveReload = new LiveReload(this)
}