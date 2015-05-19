let fs = require("fs");

// loadFavIcon
let loadFavIcon = function(iconPath, next) {
    fs.readFile(iconPath, function(error, data) {
        if(error) {
            next(null, null);
            return;
        }
        
        next(null, data);
    });
};

module.exports = loadFavIcon;