module.exports = function() {
	if(!this.verbose)
		return

	this.separator(this.color.styles)
	this.logCodeSize('Styles', this.css, this.color.styles)

	this.separator(this.color.scripts)
	this.logCodeSize('Scripts', this.js, this.color.scripts)
}