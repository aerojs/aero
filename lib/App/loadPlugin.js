const path = require('path')

module.exports = function*(pluginName) {
	let shortPluginName = pluginName.replace('aero-', '')

	if(this.verbose)
		this.loading('plugin', this.color.plugins(shortPluginName))

	let plugin = null

	try {
		plugin = require(pluginName)
	} catch(e) {
		pluginName = path.join(this.alternativePluginPath, pluginName)
		plugin = require(pluginName)
	}

	// If it's defined as a function, execute it and get an instance
	if(typeof plugin === 'function') {
		if(plugin.constructor.name === 'GeneratorFunction') {
			let coroutine = Promise.coroutine(plugin)
			yield coroutine(this)
		} else {
			plugin(this)
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

	return Promise.all(tasks)
	.then(() => this.events.emit('plugin loaded', plugin))
	.catch(error => this.log(error))
}