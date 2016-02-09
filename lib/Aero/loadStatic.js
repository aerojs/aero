module.exports = function() {
	this.config.static.forEach(directory => {
		this.get(directory, this.onFileRequest.bind(this))
	})
}