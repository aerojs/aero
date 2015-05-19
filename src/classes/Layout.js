// Modules
let async = require("async");
let path = require("path");

// Functions
let loadTemplate = require("../functions/loadTemplate");

// Layout
let Layout = function(layoutPath) {
    this.id = path.basename(layoutPath);
    this.path = layoutPath;
    this.templatePath = path.resolve(path.join(this.path, this.id + ".jade"));
    
    async.parallel({
		render: loadTemplate.bind(this)
	}, function(error, data) {
        this.render = data.render;
    }.bind(this));
};

module.exports = Layout;