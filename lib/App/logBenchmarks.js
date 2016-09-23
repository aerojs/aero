const suffix = ' ms'

module.exports = function logBenchmarks() {
	this.separator()

	let total = this.benchmarks.All

	Object.keys(this.benchmarks)
	.sort((a, b) => this.benchmarks[b] - this.benchmarks[a])
	.forEach(phase => {
		let time = this.benchmarks[phase]

		if(isNaN(parseInt(time)))
			return

		let timeString = time.toString()
		let spacer = ' '.repeat(Math.max(this.columns - phase.length - ':'.length - timeString.length - suffix.length, 0))
		let color = null

		if(phase === 'All')
			color = x => x
		else if(time >= 1000)
			color = this.chalk.red
		else if(time >= 100)
			color = this.chalk.yellow
		else
			color = this.chalk.green

		console.log(`${phase}:${spacer}${color(timeString)}${this.chalk.dim(suffix)}`)
	})
}