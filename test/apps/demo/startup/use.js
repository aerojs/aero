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