test('App: Demo', Promise.coroutine(function*(t) {
	let app = aero('test/apps/demo')
	app.verbose = false

	yield app.run()
	t.appOk(app)
	yield app.stop()
}))