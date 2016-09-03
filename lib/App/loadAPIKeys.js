module.exports = function*() {
	let apiKeysPath = this.path('security/api-keys.json')
	let apiKeysText = yield this.loadFile(apiKeysPath, {})

	this.api = Object.assign({}, JSON.parse(apiKeysText))
	Object.freeze(this.api)

	this.events.emit('api keys loaded')
}