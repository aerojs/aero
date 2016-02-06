test('API: Members', t => {
	let app = aero('test/app')
	let members = [
		'server',
		'verbose',
		'root'
	]

	t.plan(members.length)
	members.forEach(member => t.ok(app[member], `app.${member}`))
})