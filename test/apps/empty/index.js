let aero = require('../../../lib')

global.app = aero('test/apps/empty')
module.exports = app.run()