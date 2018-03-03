// routes.js sets up the endpoints
const http = require('http');
const bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(bodyParser.json());



    /*
     * GET /vehicles/:id
     * returns JSON in the following format:
     * {
     *     "vin": "1213231",
     *     "color": "Metallic Silver",
     *     "doorCount": 4,
     *     "driveTrain": "v8"
     * }
     */
    app.all('/vehicles/:id', (req, res) => {
        if (req.method !== 'GET') {
            res.statusCode = 405;
            res.end();
        }
        const id = req.params.id;
        const data = `{"id": ${id}, "responseType": "JSON"}`;
        callGmApi('/getVehicleInfoService', data)
        .then((gmData) => {
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
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({vin, color, doorCount, driveTrain}));
        }, (err) => {
            console.log(err);
        });
    });


    /*
     * GET /vehicles/:id/doors
     * returns JSON in the following format:
     * [
     *     {
     *         "location": "frontLeft",
     *         "locked": true
     *     },
     *     {
     *         "location": "frontRight",
     *         "locked": true
     *     }
     * ]
     */
    app.all('/vehicles/:id/doors', (req, res) => {
        if (req.method !== 'GET') {
            res.statusCode = 405;
            res.end();
        }
        const id = req.params.id;
        const data = `{"id": ${id}, "responseType": "JSON"}`;
        callGmApi('/getSecurityStatusService', data)
        .then((gmData) => {
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
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(doorData));
        }, (err) => {
            console.log(err);
        });
    });


    /*
     * GET /vehicles/:id/fuel
     * returns JSON in the following format:
     * {
     *     "percent": 30
     * }
     */
    app.all('/vehicles/:id/fuel', (req, res) => {
        if (req.method !== 'GET') {
            res.statusCode = 405;
            res.end();
        }
        const id = req.params.id;
        const data = `{"id": ${id}, "responseType": "JSON"}`;
        callGmApi('/getEnergyService', data)
        .then((gmData) => {
            gmData = JSON.parse(gmData);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            // cast tankLevel to a number
            res.end(JSON.stringify({"percent": +gmData.data.tankLevel.value}));
        }, (err) => {
            console.log(err);
        });
    });


    /*
     * GET /vehicles/:id/battery
     * returns JSON in the following format:
     * {
     *     "percent": 30
     * }
     */
    app.all('/vehicles/:id/battery', (req, res) => {
        if (req.method !== 'GET') {
            res.statusCode = 405;
            res.end();
        }
        const id = req.params.id;
        const data = `{"id": ${id}, "responseType": "JSON"}`;
        callGmApi('/getEnergyService', data)
        .then((gmData) => {
            gmData = JSON.parse(gmData);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            // cast batteryLevel to a number
            res.end(JSON.stringify({"percent": +gmData.data.batteryLevel.value}));
        }, (err) => {
            console.log(err);
        });
    });


    /*
     * POST /vehicles/:id/engine
     * returns JSON in the following format:
     * {
     *     "status": "success|error"
     * }
     */
    app.all('/vehicles/:id/engine', (req, res) => {
        if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end();
        }
        const id = req.params.id;
        const action = req.body.action;
        const data = `{"id": ${id}, "command": "${action}_VEHICLE", "responseType": "JSON"}`;
        callGmApi('/actionEngineService', data)
        .then((gmData) => {
            gmData = JSON.parse(gmData);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            var status;
            if (gmData.actionResult.status === "EXECUTED") {
                status = "success";
            } else if (gmData.actionResult.status === "FAILED") {
                status = "error";
            } else {
                res.statusCode = 500;
                res.end("");
            }
            res.end(JSON.stringify({"status": status}));
        }, (err) => {
            console.log(err);
        });
    });

    // callGmApi makes http requests to the GM API
    function callGmApi(endpoint, data) {
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
};
