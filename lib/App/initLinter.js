const linterModules = [
	'performance',
	'purifycss',
	'html5',
	'json',
]

module.exports = function() {
	linterModules.forEach(name => this.linter.use(require('../Linter/' + name).bind(this)))

	// Prevent multiple execution of this function
	this.initLinter = () => null
}