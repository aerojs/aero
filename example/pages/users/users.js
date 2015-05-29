module.exports = {
	render: function(request, render) {
		render({
			user: request.params[0],
			type: request.params[1],
			ip: request.connection.remoteAddress
		});
	}
};