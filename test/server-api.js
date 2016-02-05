test('API: Server', t => {
	let app = aero('test/app')
	let methods = [
		'run',
		'stop'
	]

	t.plan(methods.length)
	methods.forEach(method => t.ok(app.server[method], `app.server.${method}`))
})