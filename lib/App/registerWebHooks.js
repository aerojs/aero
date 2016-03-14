let exec = Promise.promisify(require('child_process').exec)

module.exports = function() {
	// GitHub service hook
	this.server.routes.POST['git/pull'] = (request, response) => {
		// TODO: This can result in race conditions. Fix it.
		if(this.updating)
			return response.end()

		this.updating = true
		console.log('Updating...')

		exec('git pull')
		.then(output => {
			console.log(output)

			response.writeHead(200)
			response.end(output)
		})
		.catch(error => {
			response.writeHead(500)
			response.end(error.toString())
		})
		.finally(() => {
			this.updating = false
		})
	}
}