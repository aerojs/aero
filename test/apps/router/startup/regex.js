app.get(/^\+(.*)$/, (request, response) => {
	response.end(request.params[0])
})