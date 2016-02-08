module.exports = function() {
	// Layout modifications
	this.on('layout modified', function*() {
		yield this.loadLayout()
		yield this.loadPages()
	})

	// Recompile styles when modified
	this.on('style modified', function*() {
		yield this.loadStyles()
		yield this.loadPages()
	})

	// Recompile scripts when modified
	this.on('script modified', function*() {
		yield this.loadScripts()
		yield this.loadPages()
	})

	// Page modifications
	this.on('page modified', pageId => {
		this.loadPage(pageId)
	})
}