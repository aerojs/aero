module.exports = function*() {
	this.time('Linter')
	this.separator()

	// Sort pages by URL
	let pages = Array.from(this.pages).sort((a, b) => a[1].url.localeCompare(b[1].url))

	let methods = {}

	for(let tuple of pages) {
		let page = tuple[1]

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