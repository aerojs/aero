module.exports = function() {
	this.ready = this.flow([
		[
			'loadConfig',
			'loadPackage'
		],
		[
			'loadStyles',
			'loadScripts'
		],
		'loadLayout',
		'loadPages'
	])

	return this.ready
}