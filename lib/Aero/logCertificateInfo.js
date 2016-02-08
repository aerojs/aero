module.exports = function() {
	// Show certificate expiration date
	let expirationDate = new Date(this.certificate.validity.end)
	let now = new Date()
	let timeRemaining = expirationDate - now
	let daysRemaining = Math.round(timeRemaining / (24 * 60 * 60 * 1000))
	let expiresOn = daysRemaining.toString() + (Math.abs(daysRemaining) === 1 ? ' day' : ' days')
	let expiresColor = null

	if(timeRemaining < 0)
		expiresColor = chalk.red
	else if(timeRemaining > 7 * 24 * 60 * 60 * 1000)
		expiresColor = chalk.green
	else
		expiresColor = chalk.yellow

	let prefix = 'SSL certificate expiration:'
	console.log(prefix + ' '.repeat(this.columns - prefix.length - expiresOn.length) + expiresColor(expiresOn))
}