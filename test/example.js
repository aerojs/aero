"use strict";

let aero = require("../src");
let example = require("../example");
let assert = require("assert");

describe("example", function() {
	describe("server", function() {
		it("should run", function(done) {
			example("silent");
			
			// Stop server after it started
			aero.events.on("server started", function() {
				aero.stop();
				done();
			});
		});
	});
});