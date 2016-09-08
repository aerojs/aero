let aero = require('../../../lib')

global.app = aero('test/apps/router')
module.exports = app.run()