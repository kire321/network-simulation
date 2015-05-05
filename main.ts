/// <reference path="Q.d.ts" />
import assert = require("assert");
import Q = require('q');

class Server {
	data:string;
	dead:boolean = false;
	static sqrtPacketLoss = .9;
	//This is unrealistic -- nodes should fail based on time, not based on
	//how much we talk to them
	static nodeFailure = .99
	constructor () {}

	//Wrapper around handle that introduces failures
	send(command: string, data?: string):Q.Promise<string> {
		return this.sendTestable(command, data, Math.random(), Math.random(), Math.random());
	}

	sendTestable(command: string, data: string, nodeFailureRandomness: number, requestDropRandomness: number, responseDropRandomness: number):Q.Promise<string> {
		var deferred = Q.defer();
		deferred.reject(new Error("somebody is trying to wait forever"));
		var emptyPromise = <Q.Promise<string>>deferred.promise;
		if (this.dead) {
			return emptyPromise;
		}
		if (nodeFailureRandomness > Server.nodeFailure) {
			this.dead = true;
			return emptyPromise;
		}
		if (requestDropRandomness < Server.sqrtPacketLoss) {
			var response = Q.fcall(this.handle, command, data);
			if (responseDropRandomness < Server.sqrtPacketLoss) {
				return response;
			} else {
				return emptyPromise;
			}
		} else {
			return emptyPromise;
		}
	}


	handle(command: string, data?: string) {
		if (command === "set") {
			this.data = data;
			return "OK";
		} else if (command == "get") {
			return this.data;
		} else {
			throw new Error("I don't know that command");
		}
	}
}

function runIntegrationTestOnce():Q.Promise<string> {
	var server = new Server();
	return server.send("set", "test")
	.then(function(response) {
		assert.equal(response, "OK");
		return server.send("get");
	}).then(function(response) {
		assert.equal(response, "test");
		return "";
	});
}

function runIntegrationTest() {
	var testFailures = 0;
	var n = 100;
	var promises:Q.Promise<string>[] = [];
	for (var i = 0; i < n; i++) {
		promises.push(runIntegrationTestOnce()
		.fail(function(error: Error) {
			testFailures++;
			return "";
		}));
	}
	Q.all(promises).then(function () {
		var successRate = (n - testFailures) / n
		console.log("Integration test success rate: ")
		console.log(successRate)
	}).done();
}

function assertPromiseIsError(promise:Q.Promise<string>):Q.Promise<string> {
	return promise.then(function ():string {
		throw Error("the promise was supposed to contain an error");
	}, function () {
		return "";
	});
}

function testSend():Q.Promise<any> {
	var everythingOk = new Server().sendTestable("set", "foo", 0, 0, 0);
	everythingOk.done();
	var nodeFailure = assertPromiseIsError(new Server().sendTestable("set", "foo", 1, 0, 0));
	var requestDropped = assertPromiseIsError(new Server().sendTestable("set", "foo", 0, 1, 0));
	var responseDropped = assertPromiseIsError(new Server().sendTestable("set", "foo", 0, 0, 1));
	return Q.all([everythingOk, nodeFailure, requestDropped, responseDropped]);
}

function runUnitTests():Q.Promise<any> {
	return testSend();
}

runUnitTests().then(runIntegrationTest).done();
