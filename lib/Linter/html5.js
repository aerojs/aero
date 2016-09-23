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
		return checkHTML(response.body.toString())
	}
}

module.exports = function*(method, route, response) {
	let contentType = response.headers['content-type']

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

		yield checkHTMLResponse(response).then(displayHTMLErrors).catch(console.error)
	}
}