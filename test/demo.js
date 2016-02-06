test('App: Demo', t => {
	let app = aero('test/apps/demo')
	return app.run().then(() => {
		t.ok(app.config, 'app.config')
		t.ok(app.package, 'app.package')
	})
})