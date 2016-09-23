module.exports = function(method, route, response) {
	if(response.body.toString().startsWith('{')) {
		try {
			JSON.parse(response.body)
		} catch(error) {
			pageLog(this.chalk.red(error.toString()))
		}
	}
}