test('App: Empty', t => {
	rmdir('test/apps/empty', false)

	let app = aero('test/apps/empty')
	let ready = app.run()

	t.equal(ready, app.ready, 'app.ready')
	t.ok(app.ready.then, 'app.ready.then')

	return app.ready.then(() => {
		t.ok(app.config, 'app.config')
		t.ok(app.config.title, 'app.config.title')
		t.ok(app.config.ports, 'app.config.ports')
		t.ok(app.config.ports.http, 'app.config.ports.http')
		t.ok(app.config.ports.https, 'app.config.ports.https')
		t.ok(app.config.ports.liveReload, 'app.config.ports.liveReload')

		t.ok(app.package, 'app.package')
		t.ok(app.package.name, 'app.package.name')
		t.ok(app.package.version, 'app.package.version')
		t.ok(app.package.description, 'app.package.description')
		t.ok(app.package.dependencies, 'app.package.dependencies')

		rmdir('test/apps/empty', false)
	})
})