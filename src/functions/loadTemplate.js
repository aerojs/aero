let jade = require("jade");

// loadTemplate
let loadTemplate = function(next) {
	try {
		let compiler = jade.compileFile(this.templatePath);
		next(null, compiler);
	} catch(e) {
		if(e.code !== "ENOENT")
			console.error(e);
		
		next(null, null);
	}
};

module.exports = loadTemplate;