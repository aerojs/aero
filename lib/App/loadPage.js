let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let Page = require('../Page')
const windowsSlash = /\\/g

module.exports = function*(pageId, root) {
	let pagePath = null

	if(root)
		pagePath = path.join(root, pageId)
	else
		pagePath = path.join(this.root, this.config.path.pages, pageId)

	if(path.sep === '\\')
		pageId = pageId.replace(windowsSlash, '/')

	if(this.verbose && this.ready.isResolved())
		this.loading('page', this.color.pages(pageId))

	let page = new Page(this, pageId, pagePath)
	yield page.load()

	this.routePage(page)
	this.events.emit('page loaded', page)

	return page
}