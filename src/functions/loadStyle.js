let fs = require("fs");
let stylus = require("stylus");

// loadStyle
let loadStyle = function(next) {
	fs.readFile(this.stylePath, "utf8", function(readError, data) {
		if(readError) {
			if(readError.code !== "ENOENT")
				console.error(readError);

			next(null, null);
			return;
		}

		stylus(data).set("compress", true).render(function(stylusError, css) {
			if(stylusError) {
				console.error(stylusError);
				next(null, null);
				return;
			}

			// Compiled CSS from the stylus file
			next(null, css);
		});
	});
};

module.exports = loadStyle;