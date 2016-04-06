const suffix = ' ms'

module.exports = function logBenchmarks() {
	this.separator()

	let total = this.benchmarks.All

	Object.keys(this.benchmarks)
	.forEach(phase => {
		let time = this.benchmarks[phase]

		if(isNaN(parseInt(time)))
			return

		let timeString = time.toString()
		let spacer = ' '.repeat(Math.max(this.columns - phase.length - ':'.length - timeString.length - suffix.length, 0))
		let color = null

		if(time >= 1000)
			color = chalk.red
		else if(time >= 100)
			color = chalk.yellow
		else
			color = chalk.green

		console.log(`${phase}:${spacer}${color(timeString)}${chalk.dim(suffix)}`)
	})
}