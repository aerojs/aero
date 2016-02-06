test('App: Demo', t => {
	let app = aero('test/apps/demo')
	
	return app.run().then(() => {
		t.appOk(app)
	}).then(() => app.stop())
})