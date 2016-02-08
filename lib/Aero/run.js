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

	this.logStyleSize()

	yield this.loadLayout()
	yield fonts
	yield this.loadPages()

	this.routeStatic()
	this.registerWebHooks()

	yield this.startServer()

	this.watchFiles()
})

module.exports = function() {
	this.time('All')

	return this.ready = run.bind(this)().then(() => {
		this.timeEnd('All')

		if(this.verbose)
			this.logBenchmarks()
	})
}