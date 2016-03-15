module.exports = function() {
	Object.keys(this.config.redirect).forEach(route => {
		this.redirect(route, this.config.redirect[route])
	})
}