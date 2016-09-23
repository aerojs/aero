class Linter {
	constructor(app) {
		this.checks = [
			require('./performance'),
			require('./html5'),
			require('./json')
		].map(func => func.bind(app))
	}

	run(method, route, response) {
		for(let check of this.checks) {
			check(method, route, response)
		}
	}
}

module.exports = Linter