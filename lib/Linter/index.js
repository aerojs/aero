class Linter {
	constructor(app) {
		this.checks = [
			'performance',
			'html5',
			'json'
		].map(name => Promise.coroutine(require('./' + name).bind(app)))
	}

	run(method, route, response) {
		return Promise.all(this.checks.map(check => check(method, route, response)))
	}
}

module.exports = Linter