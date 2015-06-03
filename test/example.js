"use strict";

let aero = require("../src");
let example = require("../example");
let assert = require("assert");

aero.events.on("server started", function() {
	let request = require("supertest")(aero.server.httpServer);

	describe("example", function() {
		it("should have a valid config.json file", function() {
			let fs = require("fs");
			let path = require("path");
			assert(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "example", "config.json"))));
		});
		
		let route = function(path, status) {
			it(`should respond on ${path} expecting ${status}`, function(done) {
				request
					.get(path)
					.expect(status, done);
			});
		};
		
		route("/", 200);
		route("/_/", 200);
		route("/static", 200);
		route("/static/", 200);
		route("/_/static", 200);
		route("/_/static/", 200);
		route("/favicon.ico", 200);
		
		route("/doesntexist", 404);
		route("/404", 404);
	});
});

// Run
example("silent");