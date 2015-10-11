'use strict';

let request = require('request');
let Promise = require('bluebird');

// Promisify
Promise.promisifyAll(request);

// download
let download = function(url, defaultData) {
    return request.getAsync(url).spread(function(response, body) {
        if(response.statusCode === 404) {
            console.error(`Doesn't exist: ${url}`);

            // If it doesn't exist we'll return the default data.
            return Promise.resolve(defaultData);
        }

        // If everything went smoothly we'll return the contents
        return Promise.resolve(body);
    }).error(function() {
        console.error(`Error downloading ${url}`);

		// If there was an error we'll return the default data.
		return Promise.resolve(defaultData);
	});
};

module.exports = download;