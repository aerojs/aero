let chalk = require('chalk')

module.exports = function(msg) {
	if(msg instanceof Error)
		console.error(chalk.red(msg))
	else
		console.log(msg)
}