let EventEmitter = require('events').EventEmitter

module.exports = function() {
	this.events = new EventEmitter()
}