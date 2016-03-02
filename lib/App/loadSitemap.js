module.exports = function() {
	let getSitemapURLs = () => {
		const host = this.config.domain || request.headers.host
		const protocol = this.server.protocol + '://'
		const prefix = protocol + host + '/'

		let urlList = []

		for(let page of this.pages) {
			urlList.push(prefix + page[1].url)
		}

		urlList.sort()
		return urlList
	}

	this.get('sitemap.txt', (request, response) => {
		let urlList = getSitemapURLs()

		response.writeHead(200)
		response.end(urlList.join('\n'))
	})

	this.get('sitemap.xml', (request, response) => {
		let urlSet = getSitemapURLs().map(url => `<url><loc>${url}</loc></url>`).join()

		response.writeHead(200)
		response.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlSet}</urlset>`)
	})

	this.get('robots.txt', (request, response) => {
		response.writeHead(200)
		response.end(`User-agent: *\nDisallow: /_/\nAllow: /\nSitemap: ${this.server.protocol}://${this.config.domain}/sitemap.xml`)
	})
}