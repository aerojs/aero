let fs = Promise.promisifyAll(require('fs'))
let pem = Promise.promisifyAll(require('pem'))
let path = require('path')

let isCertificate = file => file.content.startsWith('-----BEGIN CERTIFICATE-----')
let isPrivateKey = file => file.content.indexOf('PRIVATE KEY-----') !== -1

module.exports = function*(filePath, fallback, options) {
	this.time('Certificate')

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

	this.security = {}

	if(files.length === 0)
		return

	let keys = files.filter(isPrivateKey)
	let certificates = files.filter(isCertificate)

	if(keys.length === 0 || certificates.length === 0) {
		console.warn(chalk.yellow('SSL certificate not found'))
		return
	}

	let key = keys[0]
	let cert = certificates.length === 1 ? certificates[0] : certificates.reduce((a, b) => a.content.length > b.content.length ? a : b)

	this.security.key = key.content
	this.security.cert = cert.content

	try {
		this.certificate = yield pem.readCertificateInfoAsync(cert.content)
		this.events.emit('certificate loaded', this.certificate)
	} catch(error) {
		if(error.message.indexOf('openssl') !== -1 && require('os').platform() !== 'win32')
			this.log(error)
	}

	this.timeEnd('Certificate')
}