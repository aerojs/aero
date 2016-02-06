let fs = Promise.promisifyAll(require('fs'))

let findPages = Promise.coroutine(function*(rootPath) {
	let dirs =
		fs.readdirAsync(rootPath)
		.map(file => path.join(rootPath, file))
		.filter(file => fs.statSync(file).isDirectory())

	let subs =
		dirs.map(dir => findPages(dir))

	return (yield dirs).concat(yield subs).reduce((a, b) => a.concat(b), [])
})

module.exports = function*() {
	this.time('Pages')

	yield findPages(this.path(this.config.path.pages))

	this.timeEnd('Pages')
}