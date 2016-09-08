const equalRoutes = [
	'api',
	'api/users',
	'api/users/MyUserName'
]

const okRoutes = [
	'static',
	'dynamic',
	'images/benchmark.png'
]

test('Test App: Router', function*(t) {
	global.app = aero('test/apps/router')

	let equalTest = Promise.coroutine(function*(route) {
		t.equal(yield fetch(app, route), route, '/' + route)
	})
	let okTest = Promise.coroutine(function*(route) {
		t.ok(yield fetch(app, route), '/' + route)
	})

	yield app.run()
	appOk(t, app)

	yield equalRoutes.map(equalTest)
	yield okRoutes.map(okTest)

	t.ok(JSON.parse(yield fetch(app, '/api/json')), '/api/json')

	// Regex route
	//t.equal(yield fetch(app, '/+MyUserName'), 'MyUserName', '/+MyUserName')

	// Unroute
	app.unroute('api')
	t.notOk(yield fetch(app, '/api'), 'app.unroute')

	// Git pull
	//t.ok(yield fetchPost(app, '/git/pull'), '/git/pull')

	yield app.stop()
})