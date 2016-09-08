const requester = Promise.promisifyAll(require('request'))
const zlib = Promise.promisifyAll(require('zlib'))
const html5Lint = Promise.promisify(require('html5-lint'))

const enablePositiveMessages = false

module.exports = function*(method, route) {
	// The purpose of this function is only to write stuff to the console.
	// So if writing is disabled there is nothing to do here.
	if(!this.verbose)
		return

	// We don't test static routes
	if(this.config.static.indexOf(route) !== -1)
		return

	method = method.toUpperCase()

	const url = `${this.server.protocol}://localhost:${this.server.port}/${route}`

	try {
		let startTime = new Date()
		let response = yield requester[`${method.toLowerCase()}Async`]({
			uri: url,
			timeout: 3000,
			encoding: null,
			rejectUnauthorized: false
		})
		let responseTime = new Date() - startTime
		let contentType = response.headers['content-type']
		let page = this.pages.get(route)

		if(page) {
			// Due to certain difficulties keeping this value meaningful
			// we only set responseTime once at the start of Aero apps.
			if(!page.responseTime)
				page.responseTime = responseTime

			page.responseSize = response.body.length
		}

		let pageStatusLog = msg => {
			let methodMsg = method + ' '.repeat(5 - method.length)

			let ok = `${url}`
			ok += ' '.repeat(Math.max(this.columns - 2 - ok.length - this.chalk.stripColor(msg).length - methodMsg.length, 0))

			console.log(methodMsg, this.chalk.blue(ok), msg)
		}

		if(response.statusCode !== 200) {
			pageStatusLog(this.chalk.red(response.statusCode))
			return response.statusCode
		}

		let formatTime = responseTime < 200 ? this.chalk.green : (responseTime < 1000 ? this.chalk.yellow : this.chalk.red)
		let formatSize = response.body.length < 14 * 1024 ? this.chalk.green : (response.body.length < 100 * 1024 ? this.chalk.yellow : this.chalk.red)

		let size = `${(response.body.length / 1024).toFixed(1)}`
		size = ' '.repeat(Math.max(6 - size.length, 0)) + formatSize(size) + this.chalk.dim(' KB')

		let time = `${responseTime}`
		time = ' '.repeat(Math.max(5 - time.length, 0)) + formatTime(time) + this.chalk.dim(' ms')

		pageStatusLog(size + ' ' + time)

		let pageLog = logMsg => console.log(this.chalk.blue('/' + route + ' '.repeat(Math.max(this.columns - 4 - this.chalk.stripColor(logMsg).length - route.length, 0))), logMsg)

		// HTML5 check
		let checkHTML5 = code => html5Lint(code).then(results => results.messages)
		let checkHTML5Response = response => {
			if(response.headers['content-encoding'] === 'gzip') {
				return zlib.gunzipAsync(response.body)
				.then(unzippedCode => unzippedCode.toString())
				.then(checkHTML5)
			} else {
				return checkHTML5(response.body)
			}
		}

		// HTML5 validator
		if(!this.html5ValidatorDisabled && method === 'GET' && contentType && contentType.includes('text/html')) {
			// Do not yield this because we don't want to wait for this slow response
			checkHTML5Response(response).then(messages => {
				if(messages.length === 0) {
					if(enablePositiveMessages)
						pageLog(this.chalk.green('HTML'))
					return
				}

				messages.forEach(msg => console.log(this.chalk.blue('/' + route) + ' ' + this.chalk.yellow(msg.message)))
			}).catch(error => {
				if(this.html5ValidatorDisabled)
					return

				console.error(this.chalk.red('https://html5.validator.nu/ seems to be offline'))
				this.html5ValidatorDisabled = true
			})
		}

		// JSON validator
		if(response.body.toString().startsWith('{')) {
			try {
				JSON.parse(response.body)

				if(enablePositiveMessages) {
					let validMsg = 'JSON'

					// Green if the JSON file is valid and content type fits
					// Yellow if the JSON file is valid and content type is not correct
					let color = this.chalk.green
					if(!contentType || contentType.indexOf('application/json') === -1) {
						color = this.chalk.yellow
						validMsg = 'Content type not set to application/json'
					}

					pageLog(color(validMsg))
				}
			} catch(error) {
				pageLog(this.chalk.red(error.toString()))
			}
		}

		return response.statusCode
	} catch(error) {
		console.error(this.chalk.red(`Error fetching ${url}`))
		this.log(error)
	}
}