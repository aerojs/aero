module.exports = function(type, what, override) {
	if(override)
		process.stdout.write(`Loading ${type}: ${what}\r`)
	else
		console.log(`Loading ${type}: ${what}`)
}