test('Test App: Empty', function*(t) {
	rmdir('test/apps/empty', false, ['.gitignore', 'index.js'])

	global.app = aero('test/apps/empty')
	yield app.run()

	appOk(t, app)
	t.ok(yield fetch(app, '/'), '/')

	yield app.stop()
})

test('Test App: Demo', function*(t) {
	global.app = aero('test/apps/demo')
	yield app.run()

	appOk(t, app)

	t.ok(yield fetch(app, '/'), '/')
	t.ok(yield fetch(app, '/_/'), '/_/')
	t.ok(yield fetch(app, '/api'), '/api')
	t.ok(yield fetch(app, '/_/api'), '/_/api')
	t.equal(yield fetch(app, '/redirect'), yield fetch(app, '/'), '/redirect')
	t.equal(yield fetch(app, '/sendfile'), require('fs').readFileSync('package.json', 'utf8'), '/sendfile')

	yield app.stop()
})