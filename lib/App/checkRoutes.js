module.exports = function*() {
	this.separator()

	let methods = {}

	for(let tuple of this.pages) {
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
}