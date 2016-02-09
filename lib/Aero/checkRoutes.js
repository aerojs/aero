module.exports = function() {
	for(let key of this.pages) {
		this.checkRoute('GET', key[0])
	}
}