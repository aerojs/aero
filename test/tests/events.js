const fs = require('fs')
const path = require('path')
const resave = file => fs.writeFileSync(file, fs.readFileSync(file, 'utf8'), 'utf8')
const events = [
	'server started',

	'all pages loaded',
	'all styles loaded',
	'all scripts loaded',
	'all fonts loaded',

	'config loaded',
	'package loaded',
	'certificate loaded',

	'page loaded',
	'script loaded',
	'style loaded',

	// 'config modified',
	// 'page modified',
	// 'script modified',
	// 'style modified'
]

test('Events', function*(t) {
	let app = aero('test/apps/demo')
	let fired = {}

	events.forEach(eventName => app.on(eventName, () => fired[eventName] = true))

	yield app.run()

	// Trigger modification events
	// resave(path.join(app.root, 'pages/home/home.jade'))
	// resave(path.join(app.root, 'scripts/init.js'))
	// resave(path.join(app.root, 'styles/base.styl'))
	// resave(path.join(app.root, 'config.json'))

	yield app.stop()

	events.forEach(eventName => t.true(fired[eventName], eventName))
})