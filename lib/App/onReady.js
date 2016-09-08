// let setTerminalTitle = function(title) {
// 	if(process.stdout.isTTY)
// 		process.stdout.write(String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7))
// }

module.exports = function() {
	if(!this.verbose)
		return

	this.logBenchmarks()
	this.separator()

	if(this.certificate) {
		this.logCertificateInfo()
		this.separator()
	}

	console.log(`${this.package.name}`, this.chalk.dim('started on'), this.chalk.green(`${this.server.protocol}://localhost:${this.server.port}`) + '.')
	this.separator()

	// Set terminal title
	// setTerminalTitle(this.package.name)
}