const aero = require('../../../lib')
const app = aero('test/apps/demo')

app.use(
	(request, response, next) => {
		console.log(request.url)
		next()
	},
	(request, response, next) => {
		request.globals = {
			test: 123
		}
		next()
	}
)

app.run()