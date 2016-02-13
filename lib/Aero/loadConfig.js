const defaultConfig = require('../../default/config')

module.exports = function*() {
	let configForEmptyApp = Object.assign({}, defaultConfig)

	// Exclude path settings in default file because nobody ever uses them
	delete configForEmptyApp.path

	let configPath = this.path('config.json')
	let configText = yield this.loadFile(configPath, configForEmptyApp)

	this.config = Object.assign({}, defaultConfig, JSON.parse(configText))
	Object.freeze(this.config)

	this.events.emit('config loaded')
}