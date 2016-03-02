module.exports = function() {
	let getSitemapURLs = () => {
		let prefix = '/'

		if(this.config.domain)
			prefix = this.server.protocol + '://' + host + '/'

		let urlList = []

		for(let page of this.pages.values()) {
			urlList.push(prefix + page.url)
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
		let sitemapURL = '/sitemap.xml'
		
		if(this.config.domain)
			sitemapURL = `${this.server.protocol}://${this.config.domain}/sitemap.xml`

		response.writeHead(200)
		response.end(`User-agent: *\nDisallow: /_/\nAllow: /\nSitemap: ${sitemapURL}`)
	})
}