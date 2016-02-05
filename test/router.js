/*test('File system routing', t => {
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
})*/