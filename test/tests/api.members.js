test('API: Members', t => {
	let app = aero()
	let members = [
		'root',
		'version',
		'server',
		'verbose'
	]

	t.plan(members.length)
	members.forEach(member => t.notEqual(app[member], undefined, `app.${member}`))
})