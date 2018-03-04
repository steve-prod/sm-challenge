/*
 * vehicles.js sets up the /vehicles resource API endpoints
 */

const bodyParser = require('body-parser');
const ConvertVehicleData = require('../utilities/ConvertVehicleData.js');
const GmApi = require('../services/GmApi.js');

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
        GmApi.Get('/getVehicleInfoService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.info(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(err, res);
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
        GmApi.Get('/getSecurityStatusService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.securityStatus(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(err, res);
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
        GmApi.Get('/getEnergyService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.energyToFuel(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(err, res);
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
        GmApi.Get('/getEnergyService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.energyToBattery(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(err, res);
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
        GmApi.Post('/actionEngineService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.engineAction(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(err, res);
        });
    });

};


/*
 * Helper functions
 */

function sendClient200(smartcarData, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(smartcarData));
}


function sendClient405(err, res) {
    console.log(err);
    res.statusCode = 405;
    res.end(err);
}
