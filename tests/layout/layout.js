module.exports = {
	render: function(request, render) {
		render({
			nav: ["home", "products", "contact"]
		});
	}
};