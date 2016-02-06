let run = Promise.coroutine(function*() {
	yield [
		this.loadConfig(),
		this.loadPackage()
	]

	yield this.loadPlugins()

	yield [
		this.loadStyles(),
		this.loadScripts()
	]

	yield this.loadLayout()
	yield this.loadPages()

	yield this.startServer()
})

module.exports = function() {
	return this.ready = run.bind(this)()
}