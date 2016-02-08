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

	yield this.loadLayout()
	yield fonts
	yield this.loadPages()

	yield this.startServer()

	this.registerWebHooks()
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