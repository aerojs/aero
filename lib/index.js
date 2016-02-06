global.Promise = require('bluebird')
global.chalk = require('chalk')

let Aero = require('./Aero')

module.exports = root => {
	return new Aero(root)
}