test('App: Empty', t => {
	rmdir('test/apps/empty', false, ['.gitignore'])

	let app = aero('test/apps/empty')
	let ready = app.run()

	return app.ready.then(() => {
		t.appOk(app)

		rmdir('test/apps/empty', false, ['.gitignore'])
	}).then(() => app.stop())
})