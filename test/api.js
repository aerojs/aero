"use strict";

let aero = require("../src");
let assert = require("assert");

describe("aero", function() {
	it("should be a singleton", function() {
		assert(aero === require("../src"));
	});
	
	it("should have a valid package.json file", function() {
		let fs = require("fs");
		let path = require("path");
		assert(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"))));
	});
	
	describe("run()", function() {
		it("should be defined", function() {
			assert(aero.run);
		});
	});

	describe("stop()", function() {
		it("should be defined", function() {
			assert(aero.stop);
		});
	});

	describe("server", function() {
		it("should be defined", function() {
			assert(aero.server);
		});
		
		it("should have a routes property", function() {
			assert(aero.server.routes);
		});
	});

	describe("events", function() {
		it("should be defined", function() {
			assert(aero.events);
		});
		
		it("should have an on() function", function() {
			assert(aero.events.on);
		});
	});
});