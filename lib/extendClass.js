let fs = require('fs')
let path = require('path')

let reportEmptyFunction = function(name, func) {
	let functionBody = func.toString().match(/\{([\s\S]*)\}/m)[1]
	functionBody = functionBody.replace(/^\s*\/\/.*$/mg, '').trim()

	if(functionBody.length === 0)
		console.log(chalk.yellow(name), 'is empty')
}

module.exports = (MyClass, directory) => {
	fs.readdirSync(directory)
	.map(file => path.join(directory, file))
	.filter(file => fs.statSync(file).isFile())
	.map(file => file.replace(/\.[^/.]+$/, ''))
	.forEach(file => {
		let baseName = path.basename(file)

		if(baseName === 'index')
			return

		let func = require(file)

		if(func.constructor.name === 'GeneratorFunction')
			func = Promise.coroutine(func)

		// DO NOT USE THIS IN LIVE ENVIRONMENTS
		reportEmptyFunction(baseName, func)

		MyClass.prototype[baseName] = func
	})

	return MyClass
}