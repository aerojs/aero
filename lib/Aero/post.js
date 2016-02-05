module.exports = function(path, func) {
	this.route('POST', path, func)
}