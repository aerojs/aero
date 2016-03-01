module.exports = function() {
	this.get('sitemap.txt', (request, response) => {
		response.writeHead(200)

		const protocol = (request.connection.encrypted ? 'https': 'http') + '://'
		let urlList = []
		for(let page of this.pages) {
			urlList.push(protocol + request.headers.host + '/' + page[1].url)
		}
		urlList.sort()

		response.end(urlList.join('\n'))
	})
}