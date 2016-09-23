let run = Promise.coroutine(function*() {
	this.init()
	this.initLinter()
	this.replayPast()
	this.registerEventListeners()

	yield [
		this.loadConfig(),
		this.loadPackage(),
		this.loadCache()
	]

	let fonts = this.loadFonts()

	yield this.createDirectories()

	yield [
		this.loadCertificate(),
		this.loadAPIKeys()
	]

	yield [
		this.loadPlugins(),
		this.loadIcons()
	]

	yield [
		this.loadManifest(),
		this.loadStyles(),
		this.loadScripts()
	]

	this.logFileSize()

	if(!this.production)
		this.startLiveReload()

	yield this.loadLayout()

	// Use cached font definitions if available
	let cachedFonts = this.cache.fonts[this.config.fonts.join(',')]
	if(cachedFonts)
		this.fontsCSS = cachedFonts
	else
		yield fonts

	yield this.loadPages()

	this.loadStatic()
	this.loadRedirects()
	this.loadStartup()

	yield this.startServer()

	this.watchFiles()
	this.saveCache()

	yield this.checkRoutes()

	if(this.production)
		this.cache = null
})

module.exports = function() {
	this.time('All')

	return this.ready = run.bind(this)().then(() => {
		this.timeEnd('All')
		this.events.emit('ready')
		return this
	})
}