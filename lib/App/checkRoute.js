const requester = Promise.promisifyAll(require('request'))
const zlib = Promise.promisifyAll(require('zlib'))
const htmllint = Promise.promisify(require('htmllint'))

const htmlOptions = {
	'doctype-html5': true,
	'id-no-dup': true,
	'attr-quote-style': false,
	'indent-style': false,
	'line-end-style': false,
	'id-class-style': 'dash',
	'tag-name-lowercase': false,
	'tag-name-match': false,
	'tag-bans': ['b']
}

let checkHTML = code => htmllint(code, htmlOptions)

let checkHTMLResponse = response => {
	if(response.headers['content-encoding'] === 'gzip') {
		return zlib.gunzipAsync(response.body)
		.then(unzippedCode => unzippedCode.toString())
		.then(checkHTML)
	} else {
		return checkHTML(response.body)
	}
}

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

		// HTML5 validator
		if(!this.production && method === 'GET' && contentType && contentType.includes('text/html')) {
			let displayHTMLErrors = errors => {
				if(errors.length === 0)
					return;

				errors.forEach(error => {
					// There seems to be a bug with these rules: Ignore them.
					if(error.rule === 'tag-name-match' || error.rule === 'indent-style')
						return;

					let keys = Object.keys(error.data)
					let prefix = this.chalk.blue('/' + route) + ' ' + this.chalk.yellow(error.rule)

					if(keys.length === 0) {
						console.log(prefix)
					} else if(keys.length === 1) {
						console.log(prefix + ' ' + error.data[keys[0]])
					} else {
						console.log(prefix)
						keys.forEach(key => console.log(' ' + this.chalk.dim(key) + ': ' + error.data[key]))
					}
				})
			}

			let check = () => checkHTMLResponse(response).then(displayHTMLErrors).catch(console.error)

			// If we're doing a reload of all pages because htmlLinterTasks is defined,
			// delay the linter checks until we saved the page response times.
			// Otherwise check it instantly.
			if(this.htmlLinterTasks)
				this.htmlLinterTasks.push(check)
			else
				check()
		}

		// JSON validator
		if(response.body.toString().startsWith('{')) {
			try {
				JSON.parse(response.body)
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