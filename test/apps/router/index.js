const aero = require('../../../lib')
const app = aero('test/apps/router')

app.get(/^\+(.*)$/, (request, response) => {
	response.end(request.params[0])
})

app.run()