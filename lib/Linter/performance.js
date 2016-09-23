module.exports = function*(method, route, response) {
	response.page = this.pages.get(route)

	if(response.page) {
		// Due to certain difficulties keeping this value meaningful
		// we only set responseTime once at the start of Aero apps.
		if(!response.page.responseTime)
			response.page.responseTime = response.time

		response.page.responseSize = response.body.length
	}

	let pageStatusLog = msg => {
		let methodMsg = method + ' '.repeat(5 - method.length)

		let ok = `${response.request.uri.href}`
		ok += ' '.repeat(Math.max(this.columns - 2 - ok.length - this.chalk.stripColor(msg).length - methodMsg.length, 0))

		console.log(methodMsg, this.chalk.blue(ok), msg)
	}

	if(response.statusCode !== 200) {
		pageStatusLog(this.chalk.red(response.statusCode))
		return response.statusCode
	}

	let formatTime = response.time < 200 ? this.chalk.green : (response.time < 1000 ? this.chalk.yellow : this.chalk.red)
	let formatSize = response.body.length < 14 * 1024 ? this.chalk.green : (response.body.length < 100 * 1024 ? this.chalk.yellow : this.chalk.red)

	let size = `${(response.body.length / 1024).toFixed(1)}`
	size = ' '.repeat(Math.max(6 - size.length, 0)) + formatSize(size) + this.chalk.dim(' KB')

	let time = `${response.time}`
	time = ' '.repeat(Math.max(5 - time.length, 0)) + formatTime(time) + this.chalk.dim(' ms')

	pageStatusLog(size + ' ' + time)
}