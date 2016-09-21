const chalk = require('chalk')
const emptyFunction = function() {}

let handleError = (error, request, response) => {
	console.error(chalk.bold(request.method, request.url))
	response.writeHead(500)

	let message = error.stack || error

	console.error(chalk.red(message))
	response.end(message)
}

module.exports = function(route, request, response) {
	// Execute handler
	if(this.modifiers.length === 0) {
		try {
			route(request, response)
		} catch(error) {
			handleError(error, request, response)
		}
	} else {
		let generateNext = index => {
			if(index === this.modifiers.length)
				return route.bind(undefined, request, response, emptyFunction)

			return this.modifiers[index].bind(undefined, request, response, generateNext(index + 1))
		}

		try {
			generateNext(0)()
		} catch(error) {
			handleError(error, request, response)
		}
	}
}