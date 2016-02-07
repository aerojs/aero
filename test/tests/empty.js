test('App: Empty', Promise.coroutine(function*(t) {
	rmdir('test/apps/empty', false, ['.gitignore'])

	let app = aero('test/apps/demo')

	yield app.run()
	yield app.restart()
	t.appOk(app)
	t.pass('app.restart')
	yield app.stop()

	rmdir('test/apps/empty', false, ['.gitignore'])
}))