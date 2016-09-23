class Linter {
	constructor() {
		this.checks = []
	}

	use(func) {
		this.checks.push(Promise.coroutine(func))
	}

	run(method, route, response) {
		return Promise.all(this.checks.map(check => check(method, route, response)))
	}
}

module.exports = Linter