// var chai = require('chai');
// var chaiHttp = require('chai-http');
// var server = require('../app');
// var should = chai.should();
//
// chai.use(chaiHttp);
const ConvertVehicleData = require('../utilities/ConvertVehicleData.js');
var assert = require('assert');



/*
 * Data
 */

// data from /getVehicleInfoService (GM API) and similar data
const gmInfo1234 = '{"service":"getVehicleInfo","status":"200","data":{"vin":{"type":"String","value":"123123412412"},"color":{"type":"String","value":"Metallic Silver"},"fourDoorSedan":{"type":"Boolean","value":"True"},"twoDoorCoupe":{"type":"Boolean","value":"False"},"driveTrain":{"type":"String","value":"v8"}}}';
const gmInfo1235 = '{"service":"getVehicleInfo","status":"200","data":{"vin":{"type":"String","value":"1235AZ91XP"},"color":{"type":"String","value":"Forest Green"},"fourDoorSedan":{"type":"Boolean","value":"False"},"twoDoorCoupe":{"type":"Boolean","value":"True"},"driveTrain":{"type":"String","value":"electric"}}}';
// adding Nissan Versa for 3-door model
const nissanVersa = '{"service":"getVehicleInfo","status":"200","data":{"vin":{"type":"String","value":"012345678901"},"color":{"type":"String","value":"Cherry Red"},"fourDoorSedan":{"type":"Boolean","value":"False"},"twoDoorCoupe":{"type":"Boolean","value":"False"},"driveTrain":{"type":"String","value":"Front Wheel Drive 1.6 L/98"}}}';
// adding invalid data to test error condition (both 2-door AND 4-door)
const schrödingers24Door = '{"service":"getVehicleInfo","status":"200","data":{"vin":{"type":"String","value":"012345678901"},"color":{"type":"String","value":"Cherry Red"},"fourDoorSedan":{"type":"Boolean","value":"True"},"twoDoorCoupe":{"type":"Boolean","value":"True"},"driveTrain":{"type":"String","value":"Front Wheel Drive 1.6 L/98"}}}';

// data from /getSecurityStatusService (GM API) and similar data
const gmDoors1234 = '{"service":"getSecurityStatus","status":"200","data":{"doors":{"type":"Array","values":[{"location":{"type":"String","value":"backLeft"},"locked":{"type":"Boolean","value":"True"}},{"location":{"type":"String","value":"frontRight"},"locked":{"type":"Boolean","value":"True"}},{"location":{"type":"String","value":"frontLeft"},"locked":{"type":"Boolean","value":"False"}},{"location":{"type":"String","value":"backRight"},"locked":{"type":"Boolean","value":"False"}}]}}}';
const gmDoors1235 = '{"service":"getSecurityStatus","status":"200","data":{"doors":{"type":"Array","values":[{"location":{"type":"String","value":"frontLeft"},"locked":{"type":"Boolean","value":"True"}},{"location":{"type":"String","value":"frontRight"},"locked":{"type":"Boolean","value":"False"}}]}}}';
// adding invalid data to test error condition ("yes" instead of "True")
const invalidDoorData1 = '{"service":"getSecurityStatus","status":"200","data":{"doors":{"type":"Array","values":[{"location":{"type":"String","value":"frontLeft"},"locked":{"type":"Boolean","value":"yes"}},{"location":{"type":"String","value":"frontRight"},"locked":{"type":"Boolean","value":"yeah"}}]}}}';
// adding invalid data to test error condition ("Front" instead of "front")
const invalidDoorData2 = '{"service":"getSecurityStatus","status":"200","data":{"doors":{"type":"Array","values":[{"location":{"type":"String","value":"FrontLeft"},"locked":{"type":"Boolean","value":"True"}},{"location":{"type":"String","value":"frontRight"},"locked":{"type":"Boolean","value":"False"}}]}}}';

// data from /getEnergyService (GM API)
const gmEnergy1234 = '{"service":"getEnergy","status":"200","data":{"tankLevel":{"type":"Number","value":"83.2"},"batteryLevel":{"type":"Null","value":"null"}}}';
const gmEnergy1235 = '{"service":"getEnergy","status":"200","data":{"tankLevel":{"type":"Null","value":"null"},"batteryLevel":{"type":"Number","value":"79.38"}}}';

// data from /actionEngineService (GM API)
const gmEngine1234 = '{"service":"actionEngine","status":"200","actionResult":{"status":"FAILED"}}';
const gmEngine1235 = '{"service":"actionEngine","status":"200","actionResult":{"status":"EXECUTED"}}';
// addidng invalid data to test error condition ()
const invalidEngineData = '{"service":"actionEngine","status":"200","actionResult":{"status":"STARTED"}}';



/*
 * Tests
 */

describe('ConvertVehicleData', function() {
    it('should convert GM API-style vehicle info to Smartcar API-style vehicle info', function(done) {
        // test against data for /vehicles/1234
        assert.equal(ConvertVehicleData.info(gmInfo1234).vin, "123123412412");
        assert.equal(ConvertVehicleData.info(gmInfo1234).color, "Metallic Silver");
        assert.equal(ConvertVehicleData.info(gmInfo1234).doorCount, 4);
        assert.equal(ConvertVehicleData.info(gmInfo1234).driveTrain, "v8");
        // test against data for /vehicles/1235
        assert.equal(ConvertVehicleData.info(gmInfo1235).vin, "1235AZ91XP");
        assert.equal(ConvertVehicleData.info(gmInfo1235).color, "Forest Green");
        assert.equal(ConvertVehicleData.info(gmInfo1235).doorCount, 2);
        assert.equal(ConvertVehicleData.info(gmInfo1235).driveTrain, "electric");
        // test against data for nissanVersa
        assert.equal(ConvertVehicleData.info(nissanVersa).vin, "012345678901");
        assert.equal(ConvertVehicleData.info(nissanVersa).color, "Cherry Red");
        assert.equal(ConvertVehicleData.info(nissanVersa).doorCount, 3);
        assert.equal(ConvertVehicleData.info(nissanVersa).driveTrain, "Front Wheel Drive 1.6 L/98");
        // test against data for schrödingers24Door
        assert.equal(ConvertVehicleData.info(schrödingers24Door).message.slice(0, 25), "InvalidNumberOfDoorsError");
        assert.equal(ConvertVehicleData.info(schrödingers24Door).httpStatusCode, 500);
        done();
    });
    it('should convert GM API-style door info to Smartcar API-style door info', function(done) {
        // test against data for /vehicles/1234/doors
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234).length, 4);
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234)[0].location, "frontLeft");
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234)[0].locked, false);
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234)[1].location, "frontRight");
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234)[1].locked, true);
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234)[2].location, "backLeft");
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234)[2].locked, true);
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234)[3].location, "backRight");
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1234)[3].locked, false);
        // test against data for /vehicles/1235/doors
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1235).length, 2);
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1235)[0].location, "frontLeft");
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1235)[0].locked, true);
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1235)[1].location, "frontRight");
        assert.equal(ConvertVehicleData.securityStatus(gmDoors1235)[1].locked, false);
        // test against data for invalidDoorData1
        assert.equal(ConvertVehicleData.securityStatus(invalidDoorData1).message.slice(0, 22), "InvalidDoorStatusError");
        assert.equal(ConvertVehicleData.securityStatus(invalidDoorData1).httpStatusCode, 500);
        // test against data for invalidDoorData2
        assert.equal(ConvertVehicleData.securityStatus(invalidDoorData2).message.slice(0, 28), "InvalidDoorRelationshipError");
        assert.equal(ConvertVehicleData.securityStatus(invalidDoorData2).httpStatusCode, 500);
        done();
    });
    it('should convert GM API-style fuel-level info to Smartcar API-style fuel-level info', function(done) {
        // test against data for /vehicles/1234/fuel
        assert.equal(ConvertVehicleData.energyToFuel(gmEnergy1234).percent, 83.2);
        // test against data for /vehicles/1235/fuel
        assert.equal(ConvertVehicleData.energyToFuel(gmEnergy1235).message.slice(0), "You requested the tank level of an electric vehicle.  There is no tank level.")
        assert.equal(ConvertVehicleData.energyToFuel(gmEnergy1235).httpStatusCode, 400)
        done();
    });
    it('should convert GM API-style battery-level info to Smartcar API-style battery-level info', function(done) {
        // test against data for /vehicles/1234/battery
        assert.equal(ConvertVehicleData.energyToBattery(gmEnergy1234).message.slice(0), "You requested the battery level of a petroleum-powered vehicle.  There is no battery level.")
        assert.equal(ConvertVehicleData.energyToBattery(gmEnergy1234).httpStatusCode, 400)
        // test against data for /vehicles/1235/battery
        assert.equal(ConvertVehicleData.energyToBattery(gmEnergy1235).percent, 79.38);
        done();
    });
    it('should convert GM API-style engine info to Smartcar API-style engine info', function(done) {
        // test against data for /vehicles/1234/engine (failed example)
        assert.equal(ConvertVehicleData.engineAction(gmEngine1234).status, "error");
        // test against data for /vehicles/1235/engine (succeed example)
        assert.equal(ConvertVehicleData.engineAction(gmEngine1235).status, "success");
        // test against invalid data
        assert.equal(ConvertVehicleData.engineAction(invalidEngineData).message.slice(0, 24), "InvalidEngineActionError");
        assert.equal(ConvertVehicleData.engineAction(invalidEngineData).httpStatusCode, 500);
        done();
    });
});
