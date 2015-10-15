'use strict';

let fs = require('fs');
let path = require('path');
let aero = require('../lib');
let example = require('../example');
let assert = require('assert');
let supertest = require('supertest');

aero.events.on('server started', function() {
	let request = supertest(aero.server.httpServer);

	describe('example', function() {
		it('should have a valid config.json file', function() {
			assert(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'example', 'config.json'))));
		});
	});

	describe('modifications', function() {
		it('should notice when a page has changed', function(done) {
			aero.events.on('page modified', function(page) {
				assert(page === 'home');

				request
					.get('/')
					.expect(200, done);
			});

			let templatePath = path.join(__dirname, '..', 'example', 'pages', 'home', 'home.jade');
			let template = fs.readFileSync(templatePath, 'utf8');
			fs.writeFile(templatePath, template, 'utf8');
		});

		it('should notice when a style has changed', function(done) {
			aero.events.on('style modified', function(style) {
				assert(style === 'base');

				request
					.get('/')
					.expect(200, done);
			});

			let stylePath = path.join(__dirname, '..', 'example', 'styles', aero.config.styles[0] + '.styl');
			let styleCode = fs.readFileSync(stylePath, 'utf8');
			fs.writeFile(stylePath, styleCode, 'utf8');
		});

		it('should notice when a script has changed', function(done) {
			aero.events.on('script modified', function(script) {
				assert(script === 'test');

				request
					.get('/')
					.expect(200, done);
			});

			let scriptPath = path.join(__dirname, '..', 'example', 'scripts', aero.config.scripts[0] + '.js');
			let scriptCode = fs.readFileSync(scriptPath, 'utf8');
			fs.writeFile(scriptPath, scriptCode, 'utf8');
		});
	});

	describe('routes', function() {
		let check = function(url, expectation) {
			it(`should respond on ${url} [${expectation}]`, function(done) {
				request
					.get(url)
					.expect(expectation, done);
			});
		};

		check('/', 200);
		check('/_/', 200);
		check('/api', 200);
		check('/static', 200);
		check('/static/', 200);
		check('/_/static', 200);
		check('/_/static/', 200);
		check('/style', 200);
		check('/users', 200);
		check('/users?get=1', 200);
		check('/users/test/profile', 200);
		check('/favicon.ico', 200);
		check('/very/special/route', 200);
		check('/very/special/route?get=1', 200);
		check('/doesntexist', 404);
		check('/404', 404);
		check('/+RegexRouting', 'RegexRouting\nGoogle+ style routing');
		check('/api', 'API root.');
		check('/api/MyUserName', 'API root.');
		check('/api/sub', 'API sub.');
		check('/api/custom', 'API custom.');
		check('/api/custom/MyUserName', 'API custom.');

		it(`should respond with 404 when the favicon does not exist`, function(done) {
			aero.server.favIconData = null;

			request
				.get('/' + aero.config.favIcon)
				.expect(404, done);
		});

		it(`should respond correctly after removing middleware`, function(done) {
			aero.server.modifiers = [];

			request
				.get('/')
				.expect(200, done);
		});

		it(`should not respond after stopping the server`, function(done) {
			// TODO: Actually destroy the server and check with supertest
			aero.server.stop().then(done);
		});
	});
});

// Disable log messages
aero.verbose = false;

// Run
example('silent');