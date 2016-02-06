module.exports = function(phase) {
	this.benchmarks[phase] = new Date() - this.benchmarks[phase]
}