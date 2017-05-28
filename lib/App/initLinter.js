const linterModules = [
	'performance',
	'html5',
	'json',
]

module.exports = function() {
	linterModules.forEach(name => this.linter.use(require('../Linter/' + name).bind(this)))
}