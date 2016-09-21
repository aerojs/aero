exports.render = (request, render) => {
	render(request.params.layout ? {} : undefined)
}