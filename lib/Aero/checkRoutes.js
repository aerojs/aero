let methods = {}

module.exports = function*() {
	for(let tuple of this.pages) {
		let page = tuple[1]

		for(let method of page.httpVerbs) {
			let check = () => this.checkRoute(method, page.id)

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