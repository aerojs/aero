module.exports = function(color) {
	if(!this.verbose)
		return

	let msg = '-'.repeat(this.columns)

	if(color)
		console.log(color(msg))
	else
		console.log(msg)
}