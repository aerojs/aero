let fs = require("fs");

// loadPageJSON
let loadPageJSON = function(next) {
    fs.readFile(this.jsonPath, "utf8", function(readError, data) {
		if(readError) {
			if(readError.code !== "ENOENT")
				console.error(readError);
			
			next(null, {});
			return;
		}
        
        try {
            let json = JSON.parse(data);
            next(null, json);
        } catch(e) {
            if(e)
                console.error(e);
            
            next(null, {});
        }
	});
};

module.exports = loadPageJSON;