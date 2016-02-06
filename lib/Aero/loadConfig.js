const defaultConfig = require('../../default/config')

module.exports = function*() {
	let configPath = this.path('config.json')
	let configText = yield this.loadFile(configPath, defaultConfig)
	this.config = Object.assign({}, defaultConfig, JSON.parse(configText))
}