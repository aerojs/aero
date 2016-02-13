let EventEmitter = require('events').EventEmitter

const maxColumns = 79

module.exports = function() {
	this.events = new EventEmitter()

	if(process.stdout.isTTY) {
		this.columns = Math.min(process.stdout.columns, maxColumns)

		process.stdout.on('resize', () => {
			this.columns = Math.min(process.stdout.columns, maxColumns)
		})
	} else {
		this.columns = maxColumns
	}
}