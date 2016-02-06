let chalk = require('chalk')

module.exports = function(msg) {
	if(msg.constructor === Error)
		console.error(chalk.red(msg))
	else
		console.log(msg)
}