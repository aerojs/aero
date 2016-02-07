module.exports = function*() {
	this.css = yield this.loadDirectory('styles')
}