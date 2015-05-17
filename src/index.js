let Page = require("./classes/Page");

module.exports = {
	run: function(callBack) {
		console.log("Initializing Aero...");
		callBack();
	}
};