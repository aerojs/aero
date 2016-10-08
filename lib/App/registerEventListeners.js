let path = require('path')

module.exports = function() {
	// Layout modifications
	this.on('layout modified', function*() {
		yield this.loadLayout()
		yield this.loadPages()
		this.liveReload.reload()
	})

	// Recompile styles when modified
	this.on('style modified', function*() {
		yield this.loadStyles()
		yield this.loadPages()
		yield this.saveCache()
		this.liveReload.reload()
	})

	// Recompile scripts when modified
	this.on('script modified', function*() {
		yield this.loadScripts()
		yield this.saveCache()
		this.liveReload.reload()
	})

	// Rerun startup script
	this.on('startup modified', moduleName => {
		this.loadStartup()
	})

	// Page modifications
	this.on('page modified', pageId => {
		this.loadPage(pageId)
	})

	// Route modifications: Live reload
	this.on('route modified', (method, url) => {
		if(!this.liveReload)
			return;

		this.liveReload.broadcast({
			title: 'route modified',
			url: '/' + url
		})
	})

	// Route modifications: Validate contents
	this.on('route modified', function*(method, url) {
		if(!this.server.ready || !this.server.ready.isResolved() || !this.ready.isResolved())
			return;

		yield this.checkRoute(method, url)
	})

	// Config modifications
	this.on('config modified', () => {
		if(this.verbose) {
			let msg = 'Restarting Aero because config.json has been modified'

			this.separator(this.chalk.bold)
			console.log(this.chalk.bold(msg))
			this.separator(this.chalk.bold)
		}

		this.restart()
	})

	// Save cache when fonts are loaded
	this.on('all fonts loaded', function*() {
		if(!this.cache || this.config.fonts.length === 0)
			return;

		this.cache.fonts[this.config.fonts.join(',')] = this.fontsCSS
		yield this.saveCache()
	})

	// Ready
	this.on('ready', () => {
		if(!this.verbose)
			return;

		this.logBenchmarks()
		this.separator()

		if(this.certificate) {
			this.logCertificateInfo()
			this.separator()
		}

		console.log(`${this.package.name}`, this.chalk.dim('started on'), this.chalk.green(`${this.server.protocol}://localhost:${this.server.port}`) + '.')
		this.separator()
	})

	// Remove the cache in production (lower memory consumption)
	this.on('ready', () => {
		if(this.production)
			this.cache = null
	})

	// Reload on all clients
	this.on('ready', () => {
		if(!this.liveReload)
			return

		this.liveReload.broadcast({ title: 'reload' })
	})
}