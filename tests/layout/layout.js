module.exports = {
	nav: [
		"home",
		"products",
		"contact"
	],

	render: function(request, render) {
		render({
			nav: this.nav
		});
	}
};