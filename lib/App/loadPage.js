let fs = Promise.promisifyAll(require('fs'))
let path = require('path')
let Page = require('../Page')
const pathFix = new RegExp(path.sep, 'g')

module.exports = function*(pageId) {
	let pagePath = path.join(this.root, this.config.path.pages, pageId)

	if(path.sep !== '/')
		pageId = pageId.replace(pathFix, '/')

	if(this.verbose && this.ready.isResolved())
		this.loading('page', this.color.pages(pageId))

	let page = new Page(this, pageId, pagePath)
	yield page.load()

	this.routePage(page)
	this.events.emit('page loaded', page)

	return page
}