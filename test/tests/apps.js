test('Test App: Empty', function*(t) {
	rmdir('test/apps/empty', false, ['.gitignore'])

	let app = aero('test/apps/empty')

	yield app.run()
	t.appOk(app)
	yield app.stop()
})

test('Test App: Demo', Promise.coroutine(function*(t) {
	let app = aero('test/apps/demo')

	yield app.run()
	t.appOk(app)
	yield app.stop()
}))