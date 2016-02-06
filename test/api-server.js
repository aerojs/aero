test('API: Server', t => {
	let app = aero('test/app')
	let methods = [
		'run',
		'stop'
	]

	methods.forEach(method => t.ok(app.server[method], `app.server.${method}`))

	t.notEqual(app.server.protocol, undefined, 'app.server.protocol')
	t.notEqual(app.server.port, undefined, 'app.server.port')
	t.end()
})