module.exports = function*() {
	this.js = yield this.loadDirectory('scripts')
	this.routeScripts()
}