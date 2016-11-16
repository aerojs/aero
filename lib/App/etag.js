const crypto = require('crypto')

module.exports = function(data) {
	return crypto.createHash('sha1').update(data).digest('hex')
}