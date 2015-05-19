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
			// We intentionally don't change the CSS when there is a compilation error
			// so that the website continues to be displayed correctly with the former
			// CSS for all current visitors.
			if(stylusError) {
				console.error(stylusError);
				next(null, this.css);
				return;
			}
			
			// Compiled CSS from the stylus file
			next(null, css);
		}.bind(this));
	});
};

module.exports = loadStyle;