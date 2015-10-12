'use strict';

let aero = require('../../lib');
let Promise = require('bluebird');
let loadScript = require('../../lib/functions/loadScript');

let analytics = {};

analytics.init = Promise.coroutine(function*(config) {
    if(config.UA) {
        let uaCode = `var googleAnalyticsUA = '${config.UA}';`;
        let baseScript = yield loadScript(require.resolve('./google-analytics.js'));
        let fullScript = uaCode + baseScript;

        aero.pluginScripts.push(fullScript);

        return Promise.resolve();
    } else {
        console.error('You need to specify the "UA" field for the Google Analytics plugin.');

        return Promise.reject();
    }
});

module.exports = analytics;