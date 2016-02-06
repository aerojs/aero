let aero = require('../../../lib')
let app = aero('test/apps/demo')
app.run().then(() => console.log('Running...'))