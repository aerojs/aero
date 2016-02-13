module.exports = function(path, func) {
	this.route('GET', path, func)
}