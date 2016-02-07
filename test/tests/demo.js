test('App: Demo', Promise.coroutine(function*(t) {
	let app = aero('test/apps/demo')

	yield app.run()
	t.appOk(app)
	yield app.stop()
}))