module.exports = function*() {
	this.time('Linter')
	this.separator()

	// Sort pages by URL
	let pages = Array.from(this.pages).map(tuple => tuple[1]).sort((a, b) => a.url.localeCompare(b.url))
	let methods = {}

	for(let page of pages) {
		for(let method of page.httpVerbs) {
			let check = () => this.checkRoute(method, page.url)

			if(!methods[method])
				methods[method] = [check]
			else
				methods[method].push(check)
		}
	}

	for(let method in methods) {
		for(let check of methods[method]) {
			yield check()
		}
	}

	this.timeEnd('Linter')
}