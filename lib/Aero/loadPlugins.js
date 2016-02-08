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

	this.separator(this.color.plugins)

	// Load all plugins in the order they were listed
	yield Promise.each(this.pluginList, plugin => this.loadPlugin(plugin))

	// Remove trailing whitespace from scripts
	this.pluginScripts = this.pluginScripts.map(code => code ? code.trim() : null)

	this.timeEnd('Plugins')
}