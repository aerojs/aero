test('API: Functions', t => {
	let app = aero('test/app')
	let methods = [
		'run',
		'stop',
		'restart',
		'get',
		'post',
		'use',
		'on'
	]

	t.plan(methods.length)
	methods.forEach(method => t.ok(app[method], `app.${method}`))
})

test('API: Members', t => {
	let app = aero('test/app')
	let members = [
		'config',
		'package',
		'server',
		'verbose'
	]

	t.plan(members.length)
	members.forEach(member => t.ok(app[member], `app.${member}`))
})