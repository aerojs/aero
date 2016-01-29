'use strict';

let fs = require('fs');
let path = require('path');
let app = require('../example');
let assert = require('assert');
let supertest = require('supertest');

app.verbose = false

//let restarts = 0
//let restartCallback = undefined

/*describe('api', function() {
	it('app.run', () => {
		assert(app.run);
	});

	it('app.get', () => {
		assert(app.get);
	});

	it('app.use', () => {
		assert(app.use);
	});

	it('app.on', () => {
		assert(app.on);
	});

	it('app.stop', () => {
		assert(app.stop);
	});
});*/

app.ready.then(() => {
	/*if(restartCallback && restarts === 1) {
		restartCallback()
		return
	}

	if(restarts !== 0)
		return*/

	let request = supertest(app.server.httpServer);

	describe('example', function() {
		it('should have a valid config.json file', function() {
			let configPath = path.join(__dirname, '..', 'example', 'config.json')
			let code = fs.readFileSync(configPath, 'utf8')

			assert(JSON.parse(code));
		});
	});

	describe('modifications', function() {
		it('should notice when a page has changed', function(done) {
			app.on('page modified', function(page) {
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
			app.on('style modified', function(style) {
				assert(style === 'base');

				request
					.get('/')
					.expect(200, done);
			});

			let stylePath = path.join(__dirname, '..', 'example', 'styles', app.config.styles[0] + '.styl');
			let styleCode = fs.readFileSync(stylePath, 'utf8');
			fs.writeFile(stylePath, styleCode, 'utf8');
		});

		it('should notice when a script has changed', function(done) {
			app.on('script modified', function(script) {
				assert(script === 'test');

				request
					.get('/')
					.expect(200, done);
			});

			let scriptPath = path.join(__dirname, '..', 'example', 'scripts', app.config.scripts[0] + '.js');
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

		// Static
		check('/images/avatar.webp', 200);
		check('/images/avatar.webp', 200); // test caching
		check('/images/doesntexist.webp', 404);
		check('/images/doesntexist.abcdef', 404);
		check('/images/text', 'Plain text.');
		check('/images/.', 404);
		check('/images/..', 404);
		check('/images/../', 403);
		check('/images/../config.json', 403);

		// RegEx
		check('/+RegexRouting', 'RegexRouting: Google+');

		// API
		check('/api', 'API root.');
		check('/api/MyUserName', 'API root.');
		check('/api/sub', 'API sub.');
		check('/api/redirect', 302);
		check('/api/custom', 'API custom.');
		check('/api/custom/MyUserName', 'API custom.');

		// Various strings passed to app.get
		app.get('trailing-slash/', (req, res) => res.end('Ok.'))
		app.get('/both-slashes/', (req, res) => res.end('Ok.'))

		check('/trailing-slash', 'Ok.');
		check('/both-slashes', 'Ok.');
	});

	describe('other', function() {
		it(`should respond via LiveReload server`, function(done) {
			supertest(app.liveReload.httpServer)
				.get('/')
				.expect(200, done)
		})

		it(`should respond with 404 when the favicon does not exist`, function(done) {
			app.server.favIconData = null;

			request
				.get('/' + app.config.favIcon)
				.expect(404, done);
		});

		it(`should respond correctly after removing middleware`, function(done) {
			app.server.modifiers = [];

			request
				.get('/')
				.expect(200, done);
		});

		/*it(`should restart`, function(done) {
			restartCallback = done

			restarts += 1
			app.restart()
		});*/
	});
})