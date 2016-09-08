module.exports = function() {
	// Show certificate expiration date
	let expirationDate = new Date(this.certificate.validity.end)
	let now = new Date()
	let timeRemaining = expirationDate - now
	let daysRemaining = Math.round(timeRemaining / (24 * 60 * 60 * 1000))
	let expiresOn = daysRemaining.toString()
	let daysString = (Math.abs(daysRemaining) === 1 ? ' day' : ' days')
	let expiresColor = null

	if(timeRemaining < 0)
		expiresColor = this.chalk.red
	else if(timeRemaining > 7 * 24 * 60 * 60 * 1000)
		expiresColor = this.chalk.green
	else
		expiresColor = this.chalk.yellow

	let prefix = 'SSL certificate expiration:'
	console.log(prefix + ' '.repeat(this.columns - prefix.length - expiresOn.length - daysString.length) + expiresColor(expiresOn) + this.chalk.dim(daysString))
}