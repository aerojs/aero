"use strict";

let aero = require("../src");
let example = require("../example");
let assert = require("assert");

describe("example", function() {
	it("should have a valid config.json file", function() {
		let fs = require("fs");
		let path = require("path");
		assert(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "example", "config.json"))));
	});
});

aero.events.on("server started", function() {
	let request = require("supertest")(aero.server.httpServer);

	describe("server", function() {
		it("should run", function(done) {
			done();
		});

		it("should respond on / expecting 200", function(done) {
			request
				.get("/")
				.expect(200, done);
		});
		
		it("should respond on /_/ expecting 200", function(done) {
			request
				.get("/_/")
				.expect(200, done);
		});
		
		it("should respond on /static expecting 200", function(done) {
			request
				.get("/static")
				.expect(200, done);
		});
		
		it("should respond on /static/ expecting 200", function(done) {
			request
				.get("/static/")
				.expect(200, done);
		});
		
		it("should respond on /_/static expecting 200", function(done) {
			request
				.get("/_/static")
				.expect(200, done);
		});
		
		it("should respond on /_/static/ expecting 200", function(done) {
			request
				.get("/_/static/")
				.expect(200, done);
		});
		
		it("should respond on /404 expecting 404", function(done) {
			request
				.get("/404")
				.expect(404, done);
		});
		
		it("should respond on /doesntexist expecting 404", function(done) {
			request
				.get("/doesntexist")
				.expect(404, done);
		});
		
		it("should respond on /favicon.ico expecting 200", function(done) {
			request
				.get("/favicon.ico")
				.expect(200, done);
		});
	});
});

// Run
example("silent");