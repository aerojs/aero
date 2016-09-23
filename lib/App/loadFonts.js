let request = Promise.promisifyAll(require('request'))

const maxRetries = 5

module.exports = function*() {
	if(this.config.fonts.length === 0) {
		this.events.emit('all fonts loaded')
		return
	}

	if(this.verbose)
		this.loading('fonts', this.chalk.bold(this.config.fonts.join(', ')))

	this.time('Fonts')

	// Use cached font definitions if available
	let cachedFonts = this.cache.fonts[this.config.fonts.join(',')]

	if(cachedFonts) {
		this.fontsCSS = cachedFonts
	} else {
		let response = null

		for(let i = 0; i <= maxRetries; i++) {
			if(i !== 0)
				console.log(`Retrying to download font definitions ${i}/${maxRetries}`)

			try {
				response = yield request.getAsync('https://fonts.googleapis.com/css?family=' + this.config.fonts.join('|'))
				break
			} catch(error) {
				this.log(error)
			}
		}

		// If fonts could not be loaded we proceed as if fonts were not defined.
		// It should not crash the server.
		// This is meant as a fallback because we want high availability.

		if(response && response.body) {
			// Minify: Remove newline and other characters
			this.fontsCSS = response.body
			.replace(/(?:\r\n|\r|\n)/g, '')
			.replace(/  /g, ' ')
			.replace(/{ /g, '{')
			.replace(/: /g, ':')
			.replace(/; /g, ';')
			.replace(/, /g, ',')
		}
	}

	this.timeEnd('Fonts')
	this.events.emit('all fonts loaded')
}