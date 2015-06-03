module.exports = {
	render: function(request, render) {
		render({
			user: {
				name: 'Test user'
			}
		});
	}
};