const equalRoutes = [
	'api',
	'api/users',
	'api/users/MyUserName'
]

const okRoutes = [
	'static',
	'dynamic',
	'images/benchmark.png',
	'images/benchmark.png?parameter=value' // Test this again to check cached headers
]

test('Test App: Router', function*(t) {
	global.app = aero('test/apps/router')

	let equalTest = Promise.coroutine(function*(route) {
		t.equal((yield fetch(app, route)).body, route, '/' + route)
	})
	let okTest = Promise.coroutine(function*(route) {
		t.ok((yield fetch(app, route)).body, '/' + route)
	})

	yield app.run()
	appOk(t, app)

	yield equalRoutes.map(equalTest)
	yield okRoutes.map(okTest)

	// Invalid file requests
	t.equal((yield fetch(app, '/images/../')).statusCode, 403, '/images/../ [403]')
	t.equal((yield fetch(app, '/images/folder')).statusCode, 404, '/images/folder [404]')
	t.equal((yield fetch(app, '/images/doesnotexist')).statusCode, 404, '/images/doesnotexist [404]')

	t.ok(JSON.parse((yield fetch(app, '/api/json')).body), '/api/json')

	// Regex route
	t.equal((yield fetch(app, '/+MyUserName')).body, 'MyUserName', '/+MyUserName')

	// Unroute
	app.unroute('api')
	t.notOk((yield fetch(app, '/api')).body, 'app.unroute')

	yield app.stop()
})