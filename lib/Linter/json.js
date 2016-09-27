module.exports = function*(method, route, response) {
	if(response.body.toString().startsWith('{')) {
		try {
			JSON.parse(response.body)
		} catch(error) {
			console.log(`[${this.chalk.red(route)}] ${error.toString()}`)
		}
	}
}