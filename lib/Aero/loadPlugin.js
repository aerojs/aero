module.exports = function*(pluginName) {
	let shortPluginName = pluginName.replace('aero-', '')

	if(this.verbose)
		this.loading('plugin', this.color.plugins(shortPluginName))

	let plugin = require(pluginName)

	// If it's defined as a function, execute it and get an instance
	if(typeof plugin === 'function') {
		if(plugin.constructor.name === 'GeneratorFunction') {
			plugin = Promise.coroutine(plugin)
			plugin = yield plugin(this)
		} else {
			plugin = plugin(this)
		}
	}

	// Save as a part of the app
	this.plugins[shortPluginName] = plugin

	let tasks = []

	if(plugin.scripts) {
		tasks.push(
			Promise.all(plugin.scripts.map(scriptName => {
				let scriptPath = require.resolve(`${pluginName}/${scriptName}`)
				return this.loadScript(scriptPath)
			})).each(script => {
				this.pluginScripts.push(script)
			})
		)
	}

	if(plugin.styles) {
		tasks.push(
			Promise.all(
				plugin.styles
				.map(styleName => this.loadStyle(require.resolve(`${pluginName}/${styleName}${this.fileExtension.styles}`)))
			).each(style => this.pluginStyles.push(style))
		)
	}

	return Promise.all(tasks).catch(error => this.log(error))
}