module.exports = function*(method, route, response) {
	let pageLog = logMsg => console.log(this.chalk.blue('/' + route + ' '.repeat(Math.max(this.columns - 2 - this.chalk.stripColor(logMsg).length - route.length, 0))), logMsg)

	if(response.body.toString().startsWith('{')) {
		try {
			JSON.parse(response.body)
		} catch(error) {
			pageLog(this.chalk.red(error.toString()))
		}
	}
}