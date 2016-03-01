'use strict'

exports.get = (request, response) => {
	let user = request.params[0]

	if(!user)
		response.end('api/users')
	else
		response.end(`api/users/${user}`)
}