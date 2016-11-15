const defaultConfig = require('../../default/config')
const chalk = require('chalk')

module.exports = function*() {
	let configForEmptyApp = Object.assign({}, defaultConfig)

	// Exclude path settings in default file because nobody ever uses them
	delete configForEmptyApp.path

	let configPath = this.path('config.json')
	let configText = yield this.loadFile(configPath, configForEmptyApp)
	let userConfig = JSON.parse(configText)

	this.config = Object.assign({}, defaultConfig, userConfig)

	// Auto-correct deprecated fields
	if(this.config.ports && this.config.ports.liveReload) {
		delete this.config.ports.liveReload
		require('fs').writeFileSync(configPath, JSON.stringify(userConfig, null, '\t'))
	}

	Object.freeze(this.config)

	this.events.emit('config loaded')
}