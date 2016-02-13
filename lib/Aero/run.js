let run = Promise.coroutine(function*() {
	this.init()
	this.replayPast()

	yield [
		this.loadConfig(),
		this.loadPackage(),
		this.loadCache()
	]

	let fonts = this.loadFonts()

	yield [
		this.createDirectories(),
		this.loadPlugins(),
		this.loadIcons()
	]

	yield [
		this.loadCertificate(),
		this.loadStyles(),
		this.loadScripts()
	]

	this.logFileSize()

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
	this.saveCache()
})

module.exports = function() {
	this.time('All')

	return this.ready = run.bind(this)().then(() => {
		this.timeEnd('All')
		this.onReady()
	})
}