let exec = Promise.promisify(require('child_process').exec)

module.exports = function() {
	// GitHub service hook
	this.server.routes.POST['git/pull'] = (request, response) => {
		// TODO: This can result in race conditions. Fix it.
		if(this.updating)
			return

		this.updating = true
		console.log('Updating...')

		exec('git pull')
		.then(stdout => {
			console.log(stdout)

			response.writeHead(200)
			response.end(stdout)
		})
		.catch(error => {
			response.writeHead(500)
			response.end(stdout)
		})
		.finally(() => {
			this.updating = false
		})
	}
}