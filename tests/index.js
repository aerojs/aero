// Modules
let aero = require("../src/aero");

// Measure startup time
let startUp = 0;

// Change directory
require("process").chdir(__dirname);

// Do something when initialized
aero.events.on("initialized", function() {
	console.log(aero.config.siteName + " has been initialized now!");
});

// Startup time
aero.events.on("server started", function() {
	console.log("Server startup: " + (Date.now() - startUp) + " ms");
});

// Do something when ready
aero.events.on("ready", function() {
	console.log(aero.config.siteName + " is ready to serve content now!");
});

// Run
startUp = Date.now();
aero.run();

aero.static("images");

// Google+ style routing
aero.get(/^\+(.*)/, function(request, response) {
	response.end("Google+ style routing");
});