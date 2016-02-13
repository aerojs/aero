module.exports = function() {
	if(!this.verbose)
		return

	this.logBenchmarks()
	this.separator()

	if(this.certificate) {
		this.logCertificateInfo()
		this.separator()
	}

	console.log(`${this.package.name}`, chalk.dim('started on'), chalk.green(`${this.server.protocol}://localhost:${this.server.port}`) + '.')
	this.separator()
}