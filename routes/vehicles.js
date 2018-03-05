/*
 * vehicles.js sets up the /vehicles resource API endpoints
 * The general design pattern used in the routes below is to:
 * 1. register the endpoint with app
 * 2. log the request
 * 3. use the GmApi service to:
 *        check user input(s) and http method
 *        send/retrieve data
 * 4. use a data conversion function from ConvertVehicleData to properly format data
 * 5. use Client service to send converted data (or error) back to the client
 * 6. log response/error
 */

const bodyParser = require('body-parser');
const ConvertVehicleData = require('../utilities/ConvertVehicleData.js');
const GmApi = require('../services/GmApi.js');
const Client = require('../services/Client.js');
const bunyan = require('bunyan');
const stoutStream = {level: 'info', stream: process.stdout};
const fileStream = {level: 'info', path: 'smartcar.log'};
var requestLogger = bunyan.createLogger({
    name: 'smartcar-api-REQUEST',
    streams: [
        stoutStream,
        fileStream
    ]
});
var responseLogger = bunyan.createLogger({
    name: 'smartcar-api-RESPONSE',
    streams: [
        stoutStream,
        fileStream
    ]
});
var errorLogger = bunyan.createLogger({
    name: 'smartcar-api-ERROR',
    streams: [
        stoutStream,
        fileStream
    ]
});

module.exports = function(app) {
    app.use(bodyParser.json());



    /*
     *    GET /vehicles/:id
     *    returns JSON in the following format:
     *    {
     *        "vin": "1213231",
     *        "color": "Metallic Silver",
     *        "doorCount": 4,
     *        "driveTrain": "v8"
     *    }
     */
    app.all('/vehicles/:id', (req, res) => {
        requestLogger.info(req.method, req.url, req.headers);
        GmApi.Get('/getVehicleInfoService', req)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.info(gmData);
            Client.sendData(smartcarData, res, 200);
            responseLogger.info(res.statusCode, res.statusMessage, res.get('Content-Type'), smartcarData);
        }, (err) => {
            Client.sendError(err, res);
            errorLogger.error(res);
        });
    });



    /*
     *    GET /vehicles/:id/doors
     *    returns JSON in the following format:
     *    [
     *        {
     *            "location": "frontLeft",
     *            "locked": true
     *        },
     *        {
     *            "location": "frontRight",
     *            "locked": true
     *        }
     *    ]
     */
    app.all('/vehicles/:id/doors', (req, res) => {
        requestLogger.info(req.method, req.url, req.headers);
        GmApi.Get('/getSecurityStatusService', req)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.securityStatus(gmData);
            Client.sendData(smartcarData, res, 200);
            responseLogger.info(res.statusCode, res.statusMessage, res.get('Content-Type'), smartcarData);
        }, (err) => {
            Client.sendError(err, res);
            errorLogger.error(res);
        });
    });



    /*
     *    GET /vehicles/:id/fuel
     *    returns JSON in the following format:
     *    {
     *        "percent": 30
     *    }
     */
    app.all('/vehicles/:id/fuel', (req, res) => {
        requestLogger.info(req.method, req.url, req.headers);
        GmApi.Get('/getEnergyService', req)
        .then((gmData) => {
            var smartcarData = {};
            try {
                smartcarData = ConvertVehicleData.energyToFuel(gmData);
                Client.sendData(smartcarData, res, 200);
                responseLogger.info(res.statusCode, res.statusMessage, res.get('Content-Type'), smartcarData);
            } catch(e) {
                Client.sendError(e, res);
                errorLogger.error(res.statusCode, res.statusMessage, e.message);
            }
        }, (err) => {
            Client.sendError(err, res);
            errorLogger.error(res);
        });
    });



    /*
     *    GET /vehicles/:id/battery
     *    returns JSON in the following format:
     *    {
     *        "percent": 30
     *    }
     */
    app.all('/vehicles/:id/battery', (req, res) => {
        requestLogger.info(req.method, req.url, req.headers);
        GmApi.Get('/getEnergyService', req)
        .then((gmData) => {
            var smartcarData = {};
            try {
                smartcarData = ConvertVehicleData.energyToBattery(gmData);
                Client.sendData(smartcarData, res, 200);
                responseLogger.info(res.statusCode, res.statusMessage, res.get('Content-Type'), smartcarData);
            } catch(e) {
                Client.sendError(e, res);
                errorLogger.error(res.statusCode, res.statusMessage, e.message);
            }
        }, (err) => {
            Client.sendError(err, res);
            errorLogger.error(res);
        });
    });



    /*
     *    POST /vehicles/:id/engine
     *    returns JSON in the following format:
     *    {
     *        "status": "success|error"
     *    }
     */
    app.all('/vehicles/:id/engine', (req, res) => {
        requestLogger.info(req.method, req.url, req.headers);
        GmApi.Post('/actionEngineService', req)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.engineAction(gmData);
            Client.sendData(smartcarData, res, 200);
            responseLogger.info(res.statusCode, res.statusMessage, res.get('Content-Type'), smartcarData);
        }, (err) => {
            Client.sendError(err, res);
            errorLogger.error(res);
        });
    });

};
