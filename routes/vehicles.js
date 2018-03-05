/*
 * vehicles.js sets up the /vehicles resource API endpoints
 * The general design pattern used in the routes below is to:
 * 1. register the endpoint with app
 * 2. use the GmApi service to:
 *        check user input(s) and http method
 *        send/retrieve data
 * 3. use a data conversion function from ConvertVehicleData to properly format data
 * 4. use Client service to send converted data (or error) back to the client
 */

const bodyParser = require('body-parser');
const ConvertVehicleData = require('../utilities/ConvertVehicleData.js');
const GmApi = require('../services/GmApi.js');
const Client = require('../services/Client.js');

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
        GmApi.Get('/getVehicleInfoService', req)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.info(gmData);
            Client.sendData(smartcarData, res, 200);
        }, (err) => {
            Client.sendError(err, res);
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
        GmApi.Get('/getSecurityStatusService', req)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.securityStatus(gmData);
            Client.sendData(smartcarData, res, 200);
        }, (err) => {
            Client.sendError(err, res);
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
        GmApi.Get('/getEnergyService', req)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.energyToFuel(gmData);
            Client.sendData(smartcarData, res, 200);
        }, (err) => {
            Client.sendError(err, res);
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
        GmApi.Get('/getEnergyService', req)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.energyToBattery(gmData);
            Client.sendData(smartcarData, res, 200);
        }, (err) => {
            Client.sendError(err, res);
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
        GmApi.Post('/actionEngineService', req)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.engineAction(gmData);
            Client.sendData(smartcarData, res, 200);
        }, (err) => {
            Client.sendError(err, res);
        });
    });

};
