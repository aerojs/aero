let exec = Promise.promisify(require('child_process').exec)

module.exports = function*() {
	this.time('Plugins')

	this.pluginScripts = []
	this.pluginStyles = []

	if(this.package.dependencies)
		this.pluginList = Object.keys(this.package.dependencies).filter(dependency => dependency.startsWith('aero-'))
	else
		this.pluginList = []

	// Figure out which plugins need to be installed
	let uninstalledPlugins = this.pluginList.filter(plugin => {
		try {
			require.resolve(plugin)
			return false
		} catch(e) {
			return true
		}
	})

	// Need to install some plugins?
	if(uninstalledPlugins.length > 0) {
		let npmCommand = 'npm install ' + uninstalledPlugins.join(' ')
		console.log(chalk.bold('Executing:'), npmCommand)

		yield exec(npmCommand).then(this.log)
	}

	this.separator(chalk.yellow)

	let loadPlugins = Promise.each(this.pluginList, Promise.coroutine(function*(pluginName) {
		let shortPluginName = pluginName.replace('aero-', '')

		if(this.verbose)
			this.loading('plugin', chalk.yellow(shortPluginName))

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
					.map(styleName => this.loadStyle(require.resolve(`${pluginName}/${styleName}.styl`)))
				).each(style => this.pluginStyles.push(style))
			)
		}

		return Promise.all(tasks).catch(error => this.log(error))
	}.bind(this))).then(() => {
		// Remove trailing whitespace from scripts
		this.pluginScripts = this.pluginScripts.map(code => code.trim())
	})

	// Wait for plugins to finish loading
	yield loadPlugins.then(() => this.timeEnd('Plugins'))
}