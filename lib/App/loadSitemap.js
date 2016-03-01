module.exports = function() {
	this.get('sitemap.txt', (request, response) => {
		response.writeHead(200)

		const host = this.config.domains[0] || request.headers.host
		const protocol = this.server.protocol + '://'
		const prefix = protocol + host + '/'

		let urlList = []
		for(let page of this.pages) {
			urlList.push(prefix + page[1].url)
		}
		urlList.sort()

		response.end(urlList.join('\n'))
	})
}