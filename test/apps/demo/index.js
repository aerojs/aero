let aero = require('../../../lib')
let app = aero('test/apps/demo')

app.use((request, response, next) => {
	console.log(request.url)
	next()
})

app.run()