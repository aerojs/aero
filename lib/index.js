global.Promise = require('bluebird')

let Aero = require('./Aero')

module.exports = root => {
	return new Aero(root)
}