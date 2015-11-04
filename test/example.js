'use strict';

let fs = require('fs');
let path = require('path');
let aero = require('../lib');
let hjson = require('hjson');
let example = require('../example');
let assert = require('assert');
let supertest = require('supertest');

aero.on('server started', function() {
	let request = supertest(aero.server.httpServer);

	describe('example', function() {
		it('should have a valid config.hjson file', function() {
			let configPath = path.join(__dirname, '..', 'example', 'config.hjson')
			let code = fs.readFileSync(configPath, 'utf8')

			assert(hjson.parse(code + '\n'));
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
		check('/images/avatar.webp', 200);
		check('/images/avatar.webp', 200); // test caching
		check('/images/doesntexist.webp', 404);
		check('/images/doesntexist.abcdef', 404);
		check('/images/text', 'Plain text.');
		check('/images/.', 404);
		check('/images/..', 404);
		check('/images/../', 403);
		check('/images/../config.hjson', 403);
		check('/+RegexRouting', 'RegexRouting: Google+');
		check('/api', 'API root.');
		check('/api/MyUserName', 'API root.');
		check('/api/sub', 'API sub.');
		check('/api/redirect', 302);
		check('/api/custom', 'API custom.');
		check('/api/custom/MyUserName', 'API custom.');

		it(`should respond via LiveReload server`, function(done) {
			supertest(aero.liveReload.httpServer)
				.get('/')
				.expect(200, done)
		})

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
			aero.stop().then(function() {
				done();
			});
		});
	});
});

aero.verbose = false

// Run
example('silent');