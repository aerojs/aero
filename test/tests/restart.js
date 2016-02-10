test('Restart', function*(t) {
	let app = aero('test/apps/demo')

	yield app.run()
	yield app.restart()
	yield app.stop()

	t.pass('completed')
})