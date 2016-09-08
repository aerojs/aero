test('Restart', function*(t) {
	global.app = aero('test/apps/empty')
	yield app.run()

	appOk(t, app)

	yield app.restart()
	yield app.stop()

	t.pass('completed')
})