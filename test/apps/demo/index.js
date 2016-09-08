let aero = require('../../../lib')

global.app = aero('test/apps/demo')
module.exports = app.run()