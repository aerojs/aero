test('API: Members', t => {
	let app = aero('test/apps/empty')
	let members = [
		'root',
		'version',
		'server',
		'verbose'
	]

	t.plan(members.length)
	members.forEach(member => t.ok(app[member], `app.${member}`))
})