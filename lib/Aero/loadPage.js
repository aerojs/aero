let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let Page = require('../Page')

module.exports = function*(pageId) {
	let pagePath = path.join(this.root, this.config.path.pages, pageId)

	if(path.sep !== '/')
		pageId = pageId.replace(path.sep, '/')

	if(this.verbose)
		this.loading('page', this.color.pages(pageId), true)

	let page = new Page(this, pageId, pagePath)
	yield page.load()

	this.routePage(page)
	this.events.emit('page loaded', page)

	return page
}