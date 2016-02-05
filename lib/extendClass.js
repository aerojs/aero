let fs = require('fs')
let path = require('path')

module.exports = (MyClass, directory) => {
	fs.readdirSync(directory).map(file => file.replace(/\.[^/.]+$/, '')).forEach(member => {
		if(member === 'index')
			return

		MyClass.prototype[member] = require(path.join(directory, member))
	})
}