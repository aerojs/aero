test('Run', t => {
	let app = aero('test/app')
	let ready = app.run()

	t.equal(ready, app.ready, 'app.ready')
	t.ok(app.ready.then, 'app.ready.then')
	t.end()
})