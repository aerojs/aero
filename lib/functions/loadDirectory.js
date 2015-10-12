'use strict';

let fs = require('fs');
let Promise = require('bluebird');

// Promisify
Promise.promisifyAll(fs);

// loadDirectory
let loadDirectory = (directoryPath, loader) =>
	fs.readdirAsync(directoryPath)
	.then(files => Promise.map(files, loader));

module.exports = loadDirectory;