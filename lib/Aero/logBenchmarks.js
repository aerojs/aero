module.exports = function logBenchmarks() {
	this.separator()
	
	Object.keys(this.benchmarks)
	.forEach(phase => console.log(phase + ':', ' '.repeat(Math.max(14 - phase.length - this.benchmarks[phase].toString().length, 0)), this.benchmarks[phase] + chalk.dim(' ms')))
}