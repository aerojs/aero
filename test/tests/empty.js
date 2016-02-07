test('App: Empty', Promise.coroutine(function*(t) {
	rmdir('test/apps/empty', false, ['.gitignore'])

	let app = aero('test/apps/empty')
	app.verbose = false

	yield app.run()
	yield app.restart()
	t.appOk(app)
	t.pass('app.restart')
	yield app.stop()
}))