let fs = Promise.promisifyAll(require('fs'))
let path = require('path')

// We load all files in the directory but
// we want to prioritize the loading order specified
// in the config array. Files that have no
// loading order defined are placed at the end.
let sortByLoadingOrder = function(a, b) {
	if(a.order === b.order)
		return 0

	if(a.order === -1)
		return 1

	if(b.order === -1)
		return -1

	return a.order - b.order
}

module.exports = function*(plural) {
	let singular = plural.slice(0, -1)
	let capitalized = singular[0].toUpperCase() + singular.slice(1)
	let capitalizedPlural = capitalized + 's'
	let color = this.color[plural]

	this.time(capitalizedPlural)
	this.separator(color)

	let result = yield fs.readdirAsync(this.path(this.config.path[plural]))
	.map(file => {
		let resourceId = file.replace(/\.[^/.]+$/, '')

		return {
			id: resourceId,
			code: '',
			order: this.config[plural].indexOf(resourceId)
		}
	})
	.then(resources => resources.sort(sortByLoadingOrder))
	.map(resource => {
		if(this.verbose)
			this.loading(singular, color(resource.id))

		let resourcePath = path.join(this.root, this.config.path.styles, resource.id + this.fileExtension[plural])

		return this[`load${capitalized}`](resourcePath).then(code => {
			resource.code = code
			this.events.emit(`${singular} loaded`, resource)
			return resource
		})
	})

	this.events.emit(`all ${plural} loaded`)
	this.timeEnd(capitalizedPlural)

	return result
}