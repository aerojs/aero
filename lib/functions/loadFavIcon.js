'use strict'

let fs = require('fs')

// loadFavIcon
let loadFavIcon = function(iconPath, callBack) {
	fs.readFile(iconPath, function(error, data) {
		if(error) {
			callBack(null)
			return
		}

		callBack(data)
	})
}

module.exports = loadFavIcon