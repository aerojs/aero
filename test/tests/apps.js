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
	t.equal(frontPage.statusCode, 200, '/ [200]')

	t.ok((yield fetch(app, '/_/')).body, '/_/')
	t.ok((yield fetch(app, '/api')).body, '/api')
	t.ok((yield fetch(app, '/_/api')).body, '/_/api')
	t.equal((yield fetch(app, '/favicon.ico')).statusCode, 404, '/favicon.ico [404]')
	t.equal((yield fetch(app, '/redirect')).body, (yield fetch(app, '/')).body, '/redirect')
	t.equal((yield fetch(app, '/sendfile')).body, require('fs').readFileSync('package.json', 'utf8'), '/sendfile')

	let syntaxError = yield fetch(app, '/error/syntax')
	t.ok(syntaxError.body.startsWith('SyntaxError'), '/error/syntax')
	t.equal(syntaxError.statusCode, 500, '/error/syntax [500]')

	let controllerError = yield fetch(app, '/error/controller')
	t.ok(controllerError.body.startsWith('ReferenceError'), '/error/controller')
	t.equal(controllerError.statusCode, 500, '/error/controller [500]')

	t.ok((yield fetch(app, '/?layout=1')).body, '/?layout=1')

	let manifest = JSON.parse((yield fetch(app, '/manifest.json')).body)
	t.ok(manifest, 'manifest')
	t.ok(manifest.name, 'manifest.name')
	t.ok(manifest.display, 'manifest.display')

	// Live modification
	let testPath = 'test/apps/demo/pages/home/home.jade'
	let contents = fs.readFileSync(testPath, 'utf8')
	fs.writeFileSync(testPath, contents.replace('Work', 'Chaos'), 'utf8')
	yield Promise.delay(250)
	let newFrontPage = yield fetch(app, '/')
	fs.writeFileSync(testPath, contents, 'utf8')

	t.notEqual(frontPage.body, newFrontPage.body, 'LiveReload (template)')

	// HTTP
	let redirectedFrontPage = yield requester.getAsync({
		url: app.localURL('/').replace('https', 'http').replace(':' + app.config.ports.https, ':' + app.config.ports.http),
		rejectUnauthorized: false
	})
	t.equal(redirectedFrontPage.statusCode, 200, 'HTTP redirect [200]')
	t.equal(redirectedFrontPage.body, newFrontPage.body, 'HTTP redirect')

	app.liveReload.broadcast({})

	yield app.stop()
})