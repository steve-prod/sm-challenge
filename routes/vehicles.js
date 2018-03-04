/*
 * vehicles.js sets up the /vehicles resource API endpoints
 */

const http = require('http');
const bodyParser = require('body-parser');
const ConvertVehicleData = require('../utilities/ConvertVehicleData.js');

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
        passGetRequestToGmApi('/getVehicleInfoService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.info(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(res);
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
        passGetRequestToGmApi('/getSecurityStatusService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.securityStatus(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(res);
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
        passGetRequestToGmApi('/getEnergyService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.energyToFuel(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(res);
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
        passGetRequestToGmApi('/getEnergyService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.energyToBattery(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(res);
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
        passPostRequestToGmApi('/actionEngineService', req, res)
        .then((gmData) => {
            const smartcarData = ConvertVehicleData.engineAction(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(res);
        });
    });

};



/*
 *    Functions below are internal functions NOT intended to be exported.  If
 *    the project were bigger and these functions needed to be used in another
 *    file, I would move them into a separate utilities file and then import
 *    them where needed.  But since this is the only file the functions below
 *    are used in, I decided to just leave them here.
 */


// passGetRequestToGmApi makes a GET request to the specified endpoint of the GM API
function passGetRequestToGmApi(endpoint, req, res) {
    if (req.method !== 'GET') {
        return new Promise((resolve, reject) => {reject("Method Not Allowed");});
    }
    const id = req.params.id;
    const data = `{"id": ${id}, "responseType": "JSON"}`;
    return makeGmApiPostRequest(endpoint, data)
}

// passPostRequestToGmApi makes a POST request to the specified endpoint of the GM API
function passPostRequestToGmApi(endpoint, req, res) {
    if (req.method !== 'POST') {
        return new Promise((resolve, reject) => {reject("Method Not Allowed");});
    }
    const id = req.params.id;
    const action = req.body.action;
    const data = `{"id": ${id}, "command": "${action}_VEHICLE", "responseType": "JSON"}`;
    return makeGmApiPostRequest(endpoint, data);
}

// makeGmApiPostRequest makes http requests to the GM API
function makeGmApiPostRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'gmapi.azurewebsites.net',
            port: 80,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        var smartcarResponse;

        const gmReq = http.request(options, (gmRes) => {
            smartcarResponse = "";
            gmRes.setEncoding('utf8');
            gmRes.on('data', (chunk) => {
                smartcarResponse += chunk;
            });
            gmRes.on('end', () => {
                resolve(smartcarResponse);
            });
        });

        gmReq.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            reject(e);
        });

        // write data to request body
        gmReq.write(data);
        gmReq.end();
    });
}

function sendClient200(smartcarData, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(smartcarData));
}


function sendClient405(res) {
    console.log(err);
    res.statusCode = 405;
    res.end(err);
}
