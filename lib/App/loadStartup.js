let fs = require('fs')

module.exports = function() {
	// TODO: Delete require.cache
	let startupPath = fs.realpathSync(this.path('startup'))
	fs.readdirSync(startupPath).forEach(mod => require(`${startupPath}/${mod}`))

	this.events.emit('startup loaded')
}