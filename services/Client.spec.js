/*
 * Unit tests for Client.js
 * Tests all functions
 */
const Client = require('../services/Client.js');
var assert = require('assert');



/*
 * Unit Tests
 */

describe('Client', function() {
    // mock Node response.  It's ok to mock the response because the purpose of
    // these unit tests is to test Client.js, not internal Node libraries.
    var res = {};
    res.statusCode = 0;
    res.headers = [];
    res.setHeader = function(headerName, headerValue) {
        this.headers.push({key: headerName, value: headerValue});
    };
    res.dataString = "";
    res.end = function(dataString) {
        this.dataString = dataString;
    };

    const smartcarData = {"vin": "1213231","color": "Metallic Silver","doorCount": 4,"driveTrain": "v8"};



    it('should send data', function(done) {
        Client.sendData(smartcarData, res, 200);
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers.length, 1);
        assert.equal(res.headers[0].key, "Content-Type");
        assert.equal(res.headers[0].value, "application/json");
        assert.equal(res.dataString, '{"vin":"1213231","color":"Metallic Silver","doorCount":4,"driveTrain":"v8"}');
        done();
    });



    it('should send error', function(done) {
        const err = {httpStatusCode: 400, message: "This is a mock error."};
        Client.sendError(err, res);
        assert.equal(res.statusCode, 400);
        assert.equal(res.dataString, "This is a mock error.");
        done();
    });
});
