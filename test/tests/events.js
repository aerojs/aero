const fs = require('fs')
const path = require('path')
const resave = (file, added) => {
	let content = fs.readFileSync(file, 'utf8')
	fs.writeFileSync(file, content + added, 'utf8')
	Promise.delay(250).then(() => fs.writeFileSync(file, content, 'utf8'))
}
const events = [
	'server started',

	'all pages loaded',
	'all styles loaded',
	'all scripts loaded',
	'all plugins loaded',
	//'all fonts loaded',

	'config loaded',
	'package loaded',
	'certificate loaded',

	'page loaded',
	'script loaded',
	'style loaded'

	// 'config modified',
	// 'page modified',
	// 'script modified',
	// 'style modified'
]

test('Events', function*(t) {
	global.app = aero('test/apps/demo')
	let fired = {}

	events.forEach(eventName => app.on(eventName, () => fired[eventName] = true))

	yield app.run()
	appOk(t, app)

	// Trigger modification events
	// resave(path.join(app.root, 'config.json'))
	resave(app.path('pages/home/home.jade'), '\np Reload works.')
	resave(app.path('scripts/init.js'), '\nconsole.log("Reload works")')
	resave(app.path('styles/base.styl'), '\nreloadWorks = true')

	yield app.stop()

	events.forEach(eventName => t.true(fired[eventName], eventName))
})