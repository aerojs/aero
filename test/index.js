let aero = require("../src");

if(!aero.events)
	throw "aero.events not defined";
else
	console.log("✓ aero.events is defined");

if(!aero.server)
	throw "aero.server not defined";
else
	console.log("✓ aero.server is defined");

if(!aero.run)
	throw "aero.run() not defined";
else
	console.log("✓ aero.run() is defined");

if(!aero.stop)
	throw "aero.stop() not defined";
else
	console.log("✓ aero.stop() is defined");

// Run example
let example = require("../example");
example("silent");

// Stop server after it started
aero.events.on("server started", function() {
	console.log(`✓ Server started in ${aero.startUpTime} ms`);
	aero.stop();
	process.exit();
});