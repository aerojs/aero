let run = Promise.coroutine(function*() {
	this.init()
	this.replayPast()
	this.registerEventListeners()

	yield [
		this.loadConfig(),
		this.loadPackage(),
		this.loadAPIKeys(),
		this.loadCache()
	]

	let fonts = this.loadFonts()

	yield this.loadCertificate()

	yield [
		this.createDirectories(),
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
	this.checkRoutes()
	this.saveCache()

	if(this.production)
		this.cache = null
})

module.exports = function() {
	this.time('All')

	return this.ready = run.bind(this)().then(() => {
		this.timeEnd('All')
		this.onReady()
		return this
	})
}