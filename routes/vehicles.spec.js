/*
 * Integration tests for vehicles.js
 * Tests all endpoints
 * Only tests for responses you would expect to get from server
 * (Error conditions are tested in GmApi integration tests and
 * ConvertVehicleData unit tests)
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app.js');
var should = chai.should();
var assert = chai.assert;

chai.use(chaiHttp);

var areTestsComplete = false;

/*
 * Integration tests
 */

describe('Smartcar API', function() {

    after(function() {
        areTestsComplete = true;
    });

    it('should retrieve properly formatted vehicle information from /vehicles/1234', function(done) {
        chai.request(server)
        .get('/vehicles/1234')
        .end(function(err, res) {
            res.should.have.status(200);
            const gmRes = JSON.parse(res.text);
            assert.equal(gmRes.vin, "123123412412");
            assert.equal(gmRes.color, "Metallic Silver");
            assert.equal(gmRes.doorCount, 4);
            assert.equal(gmRes.driveTrain, "v8");
            done();
        });
    });
    it('should retrieve properly formatted vehicle information from /vehicles/1235', function(done) {
        chai.request(server)
        .get('/vehicles/1235')
        .end(function(err, res) {
            res.should.have.status(200);
            const gmRes = JSON.parse(res.text);
            assert.equal(gmRes.vin, "1235AZ91XP");
            assert.equal(gmRes.color, "Forest Green");
            assert.equal(gmRes.doorCount, 2);
            assert.equal(gmRes.driveTrain, "electric");
            done();

        });
    });
    it('should retrieve properly formatted security information from /vehicles/1234/doors', function(done) {
        chai.request(server)
        .get('/vehicles/1234/doors')
        .end(function(err, res) {
            res.should.have.status(200);
            const gmRes = JSON.parse(res.text);
            assert.equal(gmRes[0].location, "frontLeft");
            assert.equal(gmRes[1].location, "frontRight");
            assert.equal(gmRes[2].location, "backLeft");
            assert.equal(gmRes[3].location, "backRight");
            var isBoolean = true;
            gmRes.forEach((val) => {
                if (val.locked !== true && val.locked !== false) {
                    isBoolean = false;
                }
            });
            assert.equal(isBoolean, true);
            done();
        });
    });
    it('should retrieve properly formatted security information from /vehicles/1235/doors', function(done) {
        chai.request(server)
        .get('/vehicles/1235/doors')
        .end(function(err, res) {
            res.should.have.status(200);
            const gmRes = JSON.parse(res.text);
            assert.equal(gmRes[0].location, "frontLeft");
            assert.equal(gmRes[1].location, "frontRight");
            var isBoolean = true;
            gmRes.forEach((val) => {
                if (val.locked !== true && val.locked !== false) {
                    isBoolean = false;
                }
            });
            assert.equal(isBoolean, true);
            done();
        });
    });
    it('should retrieve properly formatted fuel information from /vehicles/1234/fuel', function(done) {
        chai.request(server)
        .get('/vehicles/1234/fuel')
        .end(function(err, res) {
            res.should.have.status(200);
            const gmRes = JSON.parse(res.text);
            assert.equal(typeof gmRes.percent, "number");
            assert.equal(gmRes.percent >= 0, true);
            assert.equal(gmRes.percent <= 100, true);
            done();
        });
    });
    it('should NOT retrieve fuel information from /vehicles/1235/fuel', function(done) {
        chai.request(server)
        .get('/vehicles/1235/fuel')
        .end(function(err, res) {
            res.should.have.status(400);
            const gmRes = res.error;
            assert.equal(gmRes.status, 400);
            assert.equal(gmRes.text, "You requested the tank level of an electric vehicle.  There is no tank level.");
            done();
        });
    });
    it('should NOT retrieve battery information from /vehicles/1234/battery', function(done) {
        chai.request(server)
        .get('/vehicles/1234/battery')
        .end(function(err, res) {
            res.should.have.status(400);
            const gmRes = res.error;
            assert.equal(gmRes.status, 400);
            assert.equal(gmRes.text, "You requested the battery level of a petroleum-powered vehicle.  There is no battery level.");
            done();
        });
    });
    it('should retrieve properly formatted battery information from /vehicles/1235/battery', function(done) {
        chai.request(server)
        .get('/vehicles/1235/battery')
        .end(function(err, res) {
            res.should.have.status(200);
            const gmRes = JSON.parse(res.text);
            assert.equal(typeof gmRes.percent, "number");
            assert.equal(gmRes.percent >= 0, true);
            assert.equal(gmRes.percent <= 100, true);
            done();
        });
    });
    it('should execute engine START action properly', function(done) {
        chai.request(server)
        .post('/vehicles/1234/engine')
        .send({action: "START"})
        .end(function(err, res) {
            res.should.have.status(200);
            const gmRes = JSON.parse(res.text);
            var isSuccessOrError = false;
            if (gmRes.status === "success" || gmRes.status  === "error") {
                isSuccessOrError = true;
            }
            assert.equal(isSuccessOrError, true);
            done();
        });
    });
    it('should execute engine STOP action properly', function(done) {
        chai.request(server)
        .post('/vehicles/1234/engine')
        .send({action: "STOP"})
        .end(function(err, res) {
            res.should.have.status(200);
            const gmRes = JSON.parse(res.text);
            var isSuccessOrError = false;
            if (gmRes.status === "success" || gmRes.status  === "error") {
                isSuccessOrError = true;
            }
            assert.equal(isSuccessOrError, true);
            done();
        });
    });
});

function killTestServer() {
    setTimeout(function() {
        if (areTestsComplete) {
            server.kill();
        } else {
            killTestServer();
        }
    }, 100);
}

module.exports = {
    killTestServer: killTestServer
};
