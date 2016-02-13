module.exports = function() {
	this.manifest = Object.assign({
		name: this.config.title,
		short_name: this.config.title,
		icons: this.icons,
		start_url: '/',
		display: 'standalone',
		lang: this.config.languages[0]
	}, this.config.manifest)

	let manifestString = JSON.stringify(this.manifest)

	this.get('manifest.json', function(request, response) {
		response.writeHead(200, {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(manifestString, 'utf8'),
			'Cache-Control': 'max-age=3600'
		})

		response.end(manifestString)
	})
}