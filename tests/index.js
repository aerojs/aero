// Modules
let aero = require("../src");

// Run
aero.run(function(error) {
	if(error)
		throw error;
	
	console.log("Aero running.");
});