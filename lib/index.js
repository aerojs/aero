// Globals
global.Promise = require('bluebird')
global.chalk = require('chalk')

// Require app to be run in strict mode
try {
	require('./strict.js')
} catch(error) {
	var path = require('path')
	var main = path.relative(process.cwd(), path.basename(process.mainModule.filename))

	console.error(chalk.yellow('\nAero requires your app to run in strict mode:'))
	console.error(chalk.green(`\nnode --use_strict ${main}\n`))
	process.exit()
}

var Aero = require('./Aero')

// We export a function that generates a new app
module.exports = root => {
	return new Aero(root)
}