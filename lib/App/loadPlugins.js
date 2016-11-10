const exec = Promise.promisify(require('child_process').exec)
const path = require('path')

module.exports = function*() {
	this.time('Plugins')

	this.pluginScripts = []
	this.pluginStyles = []
	this.alternativePluginPath = '../../../'

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
			try {
				require.resolve(path.join(this.alternativePluginPath, plugin))
				return false
			} catch(e) {
				return true
			}
		}
	})

	// Need to install some plugins?
	if(uninstalledPlugins.length > 0) {
		let yarnCommand = 'yarn add ' + uninstalledPlugins.join(' ')
		console.log(this.chalk.bold('Executing:'), yarnCommand)

		yield exec(yarnCommand).then(this.log)
	}

	this.separator(this.color.plugins)

	// Load all plugins in the order they were listed
	yield Promise.each(this.pluginList, plugin => this.loadPlugin(plugin))

	// Remove trailing whitespace from scripts
	this.pluginScripts = this.pluginScripts.map(code => code ? code.trim() : null)

	this.timeEnd('Plugins')
	this.events.emit('all plugins loaded')
}