module.exports = function() {
	this.past.forEach(call => call())
}