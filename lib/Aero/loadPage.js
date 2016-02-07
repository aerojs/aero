let fs = Promise.promisifyAll(require('fs'))
let path = require('path')

module.exports = function*(pageId) {
	let pagePath = path.join(this.root, this.config.path.pages, pageId)

	if(path.sep !== '/')
		pageId = pageId.replace(path.sep, '/')

	if(this.verbose)
		this.loading('page', this.color.pages(pageId))

	this.pages.set(pageId, pageId)
	return Promise.resolve(pageId)
}