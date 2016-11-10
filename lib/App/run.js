// This allows you to describe fairly complex asynchronous models.
// Explanation below.

const bootSequence = [
	[
		'initEvents',
		'initTerminal',
		'initLinter'
	],
	'replayPast',
	'registerEventListeners',
	[
		{
			'loadConfig': {
				'createDirectories': [
					'loadCertificate',
					'loadAPIKeys'
				],
				'loadIcons': 'loadManifest',
				'loadCache': 'loadFonts'
			}
		},
		'loadPackage'
	],
	'minifyScripts',
	'loadPlugins',
	'startLiveReload',
	'loadLayout',
	[
		'loadStyles',
		'loadScripts'
	],
	'logFileSize',
	[
		'loadPages',
		'loadStatic',
		'loadRedirects'
	],
	'loadStartup',
	'startServer',
	'watchFiles',
	'saveCache',
	'checkRoutes',
	'clearCache'
]

module.exports = function() {
	this.time('All')

	// Execute an element of the boot sequence.
	// Array elements are executed in parallel.
	// Object keys are also executed in parallel,
	// values are .then() chained to the keys.
	let exec = element => {
		if(element === null)
			return Promise.resolve()

		if(typeof element === 'string')
			return this[element]()
		else if(Array.isArray(element))
			return Promise.all(element.map(sub => exec(sub)))
		else if(typeof element === 'object')
			return Promise.all(Object.keys(element).map(sub => exec(sub).then(() => exec(element[sub]))))
	}

	// Run all top-level elements of the boot sequence in sequential order
	let run = Promise.coroutine(function*(sequence) {
		for(let element of sequence) {
			let result = exec(element)

			if(result && result.then)
				yield result
		}
	}.bind(this))

	// Return a promise
	return this.ready = run(bootSequence).then(() => {
		this.timeEnd('All')
		this.events.emit('ready')
		return this
	})
}