// This module is currently not in use.

module.exports = function(response) {
	if(!response.push)
		return

	response.push('/styles.css', {
		method: 'GET',
		status: 200,
		request: {
			'Accept': 'text/css',
			'Accept-Encoding': 'br',
			'If-None-Match': this.compressedStylesHeaders.ETag
		},
		response: this.compressedStylesHeaders
	}, (error, stream) => {
		if(error)
			return console.error(error)

		stream.on('error', function(error) {
			console.error(error)
			stream.end()
		})

		stream.end(this.compressedStyles)
	})

	response.push('/scripts.js', {
		method: 'GET',
		status: 200,
		request: {
			'Accept': 'application/javascript',
			'Accept-Encoding': 'br',
			'If-None-Match': this.compressedScriptsHeaders.ETag
		},
		response: this.compressedScriptsHeaders
	}, (error, stream) => {
		if(error)
			return console.error(error)

		stream.on('error', function(error) {
			console.error(error)
			stream.end()
		})

		stream.end(this.compressedScripts)
	})
}