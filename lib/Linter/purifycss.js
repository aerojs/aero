const purify = require('purify-css')

module.exports = function*(method, route, response) {
	if(!response.page || !response.page.css || !response.page.html)
		return

	let rejectedSelectors = purify(`${response.page.html}<script>${response.page.script || ''}</script>`, response.page.css, { returnRejected: true })

	if(rejectedSelectors.length === 0)
		return

	console.log(`[${this.chalk.red(route)}] Inactive CSS selectors:`)

	rejectedSelectors.forEach(selector => {
		console.log(this.chalk.yellow(selector))
	})
}