let fs = Promise.promisifyAll(require('fs'))
let pem = Promise.promisifyAll(require('pem'))
let path = require('path')

let isCertificate = file => file.content.startsWith('-----BEGIN CERTIFICATE-----')
let isPrivateKey = file => file.content.indexOf('PRIVATE KEY-----') !== -1

module.exports = function*(filePath, fallback, options) {
	let securityPath = this.path(this.config.path.security)

	let files = yield fs.readdirAsync(securityPath)
	.filter(file => file[0] !== '.')
	.map(file => {
		return fs.readFileAsync(path.join(securityPath, file), 'ascii').then(content => {
			return {
				file,
				content
			}
		})
	})

	let keys = files.filter(isPrivateKey)
	let certificates = files.filter(isCertificate)

	this.security = {}

	if(keys.length === 0 || certificates.length === 0)
		return

	let key = keys[0]
	let cert = certificates.reduce((a, b) => a.content.length > b.content.length ? a : b)

	this.security.key = key.content
	this.security.cert = cert.content

	this.certificate = yield pem.readCertificateInfoAsync(cert.content)
	this.events.emit('certificate loaded', this.certificate)
}