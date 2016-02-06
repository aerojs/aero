test('API: Members', t => {
	let app = aero('test/app')
	let members = [
		'config',
		'package',
		'server',
		'verbose',
		'root',
		'ready'
	]

	t.plan(members.length)
	members.forEach(member => t.ok(app[member], `app.${member}`))
})