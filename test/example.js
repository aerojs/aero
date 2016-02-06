test('Run', t => {
	let app = aero('test/app')
	let ready = app.run()
	t.equal(ready, app.ready)
	t.end()
})