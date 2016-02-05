let app = null

test('Create app', t => {
	app = aero('test/app')
	t.ok(app, 'app created')
})

test('API defined', t => {
	let methods = [
		'run',
		'stop',
		'restart',
		'get',
		'post',
		'use',
		'on'
	]

	methods.forEach(method => t.ok(app[method], `app.${method}`))
})

test('File system routing', t => {
	return Promise.all([
		fetch(app, '/').expect(200),
		fetch(app, '/').expect(200)
	])
})

test('Custom routing', t => {
	app.get('/custom', (request, response) => {
		response.end('OK')
	})

	return fetch(app, '/custom').expect('OK')
})