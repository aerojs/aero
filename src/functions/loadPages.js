let async = require("async");
let fs = require("fs");

// loadPages
let loadPages = function(pagesPath, loader, next) {
    fs.readdir(pagesPath, function(error, pages) {
        if(error)
            throw error;
        
        async.map(pages, loader, function(results) {
            next(null, results);
        });
    });
};

module.exports = loadPages;