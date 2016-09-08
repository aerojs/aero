test('Test App: Empty', function*(t) {
	rmdir('test/apps/empty', false, ['.gitignore', 'index.js'])

	global.app = aero('test/apps/empty')
	yield app.run()

	appOk(t, app)
	t.ok((yield fetch(app, '/')).body, '/')

	yield app.stop()
})

test('Test App: Demo', function*(t) {
	global.app = aero('test/apps/demo')
	yield app.run()

	appOk(t, app)

	let frontPage = yield fetch(app, '/')
	t.ok(frontPage.body, '/')
	t.equal(frontPage.statusCode, 200, '/ (status code)')

	t.ok((yield fetch(app, '/_/')).body, '/_/')
	t.ok((yield fetch(app, '/api')).body, '/api')
	t.ok((yield fetch(app, '/_/api')).body, '/_/api')
	t.equal((yield fetch(app, '/redirect')).body, (yield fetch(app, '/')).body, '/redirect')
	t.equal((yield fetch(app, '/sendfile')).body, require('fs').readFileSync('package.json', 'utf8'), '/sendfile')

	let syntaxError = yield fetch(app, '/syntaxerror')
	t.ok(syntaxError.body.startsWith('SyntaxError'), '/syntaxerror')
	t.equal(syntaxError.statusCode, 500, '/syntaxerror (status code)')

	app.liveReload.broadcast({})

	yield app.stop()
})