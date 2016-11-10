const zlib = Promise.promisifyAll(require('zlib'))
const request = Promise.promisifyAll(require('request'))
const chalk = require('chalk')
const RateLimiter = require('limiter').RateLimiter

// Regex to remove the style tag
const removeStyleTagRegEx = /<style([\s\S]+?)<\/style>/g

// Limit to 1 request every 250 milliseconds
const limiter = Promise.promisifyAll(new RateLimiter(1, 200))

function requestValidation(html) {
	return request.postAsync({
		url: 'https://html5.validator.nu/?out=json',
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'User-Agent': 'Aero HTML5 Linter'
		},
		body: html
	})
}

function validateCode(code) {
	// Remove the style tag because html5.validator.nu is buggy
	// and doesn't process it correctly. Therefore we clean the
	// the response body so that there is only pure HTML left.
	code = code.replace(removeStyleTagRegEx, '')

	// Respect the rate limit, send a reque
	return limiter.removeTokensAsync(1)
	.then(() => requestValidation(code))
	.then(response => JSON.parse(response.body))
}

function validate(response) {
	if(response.headers['content-encoding'] === 'gzip') {
		return zlib.gunzipAsync(response.body)
		.then(unzippedCode => unzippedCode.toString())
		.then(validateCode)
	}

	return validateCode(response.body.toString())
}

function processValidatorJSON(json, route) {
	if(!json || !json.messages)
		return

	json.messages.forEach(error => {
		let color = chalk.yellow

		if(error.type === 'error')
			color = chalk.red

		// Delete this unnecessary comment in the message.
		error.message = error.message.replace(' (Suppressing further errors from this subtree.)', '')

		console.log(chalk.blue('/' + route), color(error.message))
	})
}

module.exports = function*(method, route, response) {
	let contentType = response.headers['content-type']

	if(this.production || method !== 'GET' || !contentType || !contentType.includes('text/html'))
		return

	validate(response)
	.then(json => processValidatorJSON(json, route))
	.catch(error => {
		if(error.toString().startsWith('SyntaxError'))
			return

		console.error(error)
	})
}