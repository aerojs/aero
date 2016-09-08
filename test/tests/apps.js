let assert = require('assert')
let appOk = function(t, app) {
	return t.doesNotThrow(() => {
		assert(app.config)
		assert(app.config.title)
		assert(app.config.ports)
		assert(app.config.ports.http)
		assert(app.config.ports.https)
		assert(app.config.ports.liveReload)

		assert(app.package)
		assert(app.package.name)
		assert(app.package.version)
		assert(app.package.description)
		assert(app.package.dependencies)

		assert(app.manifest)
		assert(app.manifest.name)

		assert(app.server.ready)
		assert(app.server.ready.then)

		assert(app.averageResponseTime !== undefined)
		assert(app.averageResponseSize !== undefined)
		assert(app.stylesSize !== undefined)
		assert(app.scriptsSize !== undefined)
	}, 'app is healthy')
}

test('Test App: Empty', function*(t) {
	rmdir('test/apps/empty', false, ['.gitignore', 'index.js'])

	let app = aero('test/apps/empty')

	yield app.run()

	appOk(t, app)

	t.ok(yield fetch(app, '/'), '/')

	yield app.stop()
})

test('Test App: Demo', function*(t) {
	let app = aero('test/apps/demo')

	yield app.run()

	appOk(t, app)

	t.ok(yield fetch(app, '/'), '/')
	t.ok(yield fetch(app, '/_/'), '/_/')
	t.ok(yield fetch(app, '/api'), '/api')
	t.ok(yield fetch(app, '/_/api'), '/_/api')
	t.equal(yield fetch(app, '/redirect'), yield fetch(app, '/'), '/redirect')

	yield app.stop()
})