/*
 * routes.js sets up the API's endpoints
 */

const http = require('http');
const bodyParser = require('body-parser');

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
            const smartcarData = convertVehicleInfo(gmData);
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
            const smartcarData = convertSecurityStatus(gmData);
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
            const smartcarData = convertEnergyToFuel(gmData);
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
            const smartcarData = convertEnergyToBattery(gmData);
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
            const smartcarData = convertEngineAction(gmData);
            sendClient200(smartcarData, res);
        }, (err) => {
            sendClient405(res);
        });
    });


    // END OF EXPORTED MODULE
};


/*
 * Data conversion functions: GM API data format -> Smartcar API data format
 */


 function convertVehicleInfo(gmData) {
     gmData = JSON.parse(gmData);
     // extract vin, color, doorCount and driveTrain from data
     const vin = gmData.data.vin.value;
     const color = gmData.data.color.value;
     var doorCount;
     // Schrödinger's car: car is simultaneously 2-door AND 4-door -> Return 500
     if (gmData.data.fourDoorSedan.value === "True" && gmData.data.twoDoorCoupe.value === "True") {
         res.statusCode = 500;
         res.end("");
     // Car is neither 2-door nor 4-door -> Return 500?  Assume 3-door?
     } else if (gmData.data.fourDoorSedan.value === "False" && gmData.data.twoDoorCoupe.value === "False") {
         res.statusCode = 500;
         res.end("");
     } else if (gmData.data.fourDoorSedan.value === "True") {
         doorCount = 4;
     } else if(gmData.data.twoDoorCoupe.value === "True") {
         doorCount = 2;
     } else {
         res.statusCode = 500;
         res.end("");
     }
     const driveTrain = gmData.data.driveTrain.value;
     return {vin, color, doorCount, driveTrain};
 }


 function convertSecurityStatus(gmData) {
     gmData = JSON.parse(gmData);
     // collect re-formatted data in doorData
     var doorData = [];
     gmData.data.doors.values.forEach((val, index) => {
         var myDoor = {};
         myDoor.location = val.location.value;
         if (val.locked.value === "True") {
             myDoor.locked = true;
         } else if (val.locked.value === "False") {
             myDoor.locked = false;
         } else {
             res.statusCode = 500;
             res.end("");
         }
         doorData.push(myDoor);
     });
     return doorData;
 }


 function convertEnergyToFuel(gmData) {
     gmData = JSON.parse(gmData);
     // cast tankLevel to a number
     return {"percent": +gmData.data.tankLevel.value};
 }


 function convertEnergyToBattery(gmData) {
     gmData = JSON.parse(gmData);
     // cast batteryLevel to a number
     return {"percent": +gmData.data.batteryLevel.value}
 }


 function convertEngineAction(gmData) {
     gmData = JSON.parse(gmData);
     var status;
     if (gmData.actionResult.status === "EXECUTED") {
         status = "success";
     } else if (gmData.actionResult.status === "FAILED") {
         status = "error";
     } else {
         res.statusCode = 500;
         res.end("");
     }
     return {"status": status};
 }



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