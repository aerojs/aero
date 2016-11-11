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

module.exports = function*(elements) {
	let element = elements.slice(0, -1)
	let capitalized = element[0].toUpperCase() + element.slice(1)
	let capitalizedPlural = capitalized + 's'
	let color = this.color[elements]

	this.time(capitalizedPlural)
	//this.separator(color)

	let result = yield fs.readdirAsync(this.path(this.config.path[elements]))
	.filter(file => !file.startsWith('.') && file.endsWith(this.fileExtension[elements]))
	.map(file => {
		let resourceId = file.replace(/\.[^/.]+$/, '')

		return {
			id: resourceId,
			code: '',
			order: this.config[elements].indexOf(resourceId)
		}
	})
	.then(resources => resources.sort(sortByLoadingOrder))
	.map(resource => {
		if(this.verbose && this.ready.isResolved())
			this.loading(element, color(resource.id))

		let resourcePath = path.join(this.root, this.config.path[elements], resource.id + this.fileExtension[elements])

		return this[`load${capitalized}`](resourcePath).then(code => {
			resource.code = code
			this.events.emit(`${element} loaded`, resource)
			return resource
		})
	})

	this.events.emit(`all ${elements} loaded`)
	this.timeEnd(capitalizedPlural)

	return result
}