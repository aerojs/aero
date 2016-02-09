let run = Promise.coroutine(function*() {
	this.init()
	this.replayPast()

	yield [
		this.loadConfig(),
		this.loadPackage()
	]

	let fonts = this.loadFonts()

	yield [
		this.createDirectories(),
		this.loadPlugins()
	]

	yield [
		this.loadCertificate(),
		this.loadStyles(),
		this.loadScripts()
	]

	if(this.verbose) {
		this.separator(this.color.styles)
		this.logCodeSize('Styles', this.css, this.color.styles)

		this.separator(this.color.scripts)
		this.logCodeSize('Scripts', this.js, this.color.scripts)
	}

	if(!this.production)
		this.startLiveReload()

	yield this.loadLayout()
	yield fonts
	yield this.loadPages()

	this.loadStatic()
	this.registerWebHooks()

	yield this.startServer()

	this.registerEventListeners()
	this.watchFiles()
	this.checkRoutes()
})

module.exports = function() {
	this.time('All')

	return this.ready = run.bind(this)().then(() => {
		this.timeEnd('All')

		if(this.verbose) {
			this.logBenchmarks()
			this.separator()

			if(this.certificate) {
				this.logCertificateInfo()
				this.separator()
			}

			console.log(`${this.package.name}`, chalk.dim('started on'), chalk.green(`${this.server.protocol}://localhost:${this.server.port}`) + '.')
			this.separator()
		}
	})
}