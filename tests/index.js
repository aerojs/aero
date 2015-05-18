// Modules
let aero = require("../src");

// Change directory
require("process").chdir(__dirname);

// Print something when initialized
aero.events.on("initialized", function(config) {
	console.log(config.siteName + " has been initialized now!");
});

// Run
aero.run();