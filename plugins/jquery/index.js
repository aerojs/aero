'use strict';

let aero = require('../../lib');
let Promise = require('bluebird');
let getFile = require('../../lib/functions/getFile');

let jquery = {};

jquery.init = Promise.coroutine(function*() {
	let scriptPath = require.resolve('./jquery.js');
	let scriptCode = yield getFile(scriptPath, '');
	aero.pluginScripts.push(scriptCode);
});

module.exports = jquery;