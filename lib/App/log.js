module.exports = function(msg) {
	if(msg instanceof Error)
		console.error(this.chalk.red(msg))
	else
		console.log(msg)
}