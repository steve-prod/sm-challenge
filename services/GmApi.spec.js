const GmApi = require('../services/GmApi.js');
var assert = require('assert');


/*
 * Tests
 */

describe('GmApi', function() {
    it('should process GET requests to Get', function(done) {
        const req = {method: "GET", params: {id: "1234"}};
        GmApi.Get('/getVehicleInfoService', req)
        .then((data) => {
            const gmData = JSON.parse(data);
            assert.equal(gmData.service, "getVehicleInfo");
            done();
        }, (err) => {
            // This should NOT occur
            console.log("Error: ", err);
        });
    });
    it('should NOT process POST requests to Get', function(done) {
        const req = {method: "POST", params: {id: "1234"}};
        GmApi.Get('/getVehicleInfoService', req)
        .then((data) => {
            const gmData = JSON.parse(data);
            assert.equal(gmData.service, "This should NOT have occurred.");
        }, (err) => {
            assert.equal(err.message, "Method Not Allowed");
            assert.equal(err.httpStatusCode, 405);
            done();
        });
    });
    it('should process POST requests to Post', function(done) {
        const req = {method: "POST", body: {action: "START"}, params: {id: "1234"}};
        GmApi.Post('/actionEngineService', req)
        .then((data) => {
            const gmData = JSON.parse(data);
            assert.equal(gmData.service, "actionEngine");
            done();
        }, (err) => {
            // This should NOT occur
            console.log("Error: ", err);
        });
    });
    it('should NOT process GET requests to Post', function(done) {
        const req = {method: "GET", params: {id: "1234"}};
        GmApi.Post('/actionEngineService', req)
        .then((data) => {
            const gmData = JSON.parse(data);
            assert.equal(gmData.service, "getVehicleInfo");
        }, (err) => {
            assert.equal(err.message, "Method Not Allowed");
            assert.equal(err.httpStatusCode, 405);
            done();
        });
    });
    it('should NOT process non-numeric IDs sent to Get', function(done) {
        const req = {method: "GET", params: {id: "123X"}};
        GmApi.Get('/actionEngineService', req)
        .then((data) => {
            const gmData = JSON.parse(data);
            assert.equal(gmData.service, "actionEngine");
        }, (err) => {
            assert.equal(err.message, "vehicle ID must be a number");
            assert.equal(err.httpStatusCode, 400);
            done();
        });
    });
    it('should NOT process non-numeric IDs sent to Post', function(done) {
        const req = {method: "POST", body: {action: "START"}, params: {id: "123X"}};
        GmApi.Post('/actionEngineService', req)
        .then((data) => {
            const gmData = JSON.parse(data);
            assert.equal(gmData.service, "actionEngine");
        }, (err) => {
            assert.equal(err.message, "vehicle ID must be a number");
            assert.equal(err.httpStatusCode, 400);
            done();
        });
    });
    it('should NOT process invalid engine actions sent to Post', function(done) {
        const req = {method: "POST", body: {action: "RESTART"}, params: {id: "1234"}};
        GmApi.Post('/actionEngineService', req)
        .then((data) => {
            const gmData = JSON.parse(data);
            assert.equal(gmData.service, "actionEngine");
        }, (err) => {
            assert.equal(err.message, "action must be either START or STOP");
            assert.equal(err.httpStatusCode, 400);
            done();
        });
    });
});
