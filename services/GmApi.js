/*
 * GmApi.js provides functions to send/retrieve data to/from the GM API
 */

const http = require('http');



// Get processes GET requests to the Smartcar API and makes POST request to GM API
function Get(endpoint, req, res) {
    if (req.method !== 'GET') {
        return new Promise((resolve, reject) => {
            reject(new MethodNotAllowedError());
        });
    }
    if (req.params.id.match(/[^0-9]/)) {
        return new Promise((resolve, reject) => {
            reject(new IdMustBeNumberError());
        });
    }
    // no reason to sanitize ID as method would have already returned if regex
    // above matched with anything
    const id = req.params.id;
    const data = `{"id": ${id}, "responseType": "JSON"}`;
    return makeGmApiPostRequest(endpoint, data)
}



// Post processes POST requests to the Smartcar API and makes POST request to GM API
function Post(endpoint, req, res) {
    if (req.method !== 'POST') {
        return new Promise((resolve, reject) => {
            reject(new MethodNotAllowedError());
        });
    }
    if (req.params.id.match(/[^0-9]/)) {
        return new Promise((resolve, reject) => {
            reject(new IdMustBeNumberError());
        });
    }
    // no reason to sanitize ID as method would have already returned if regex
    // above matched with anything
    const id = req.params.id;
    // strip non-ALPHABETIC characters from action
    const action = req.body.action.replace(/[^A-Z]/g, "");
    if (action !== "START" && action !== "STOP") {
        return new Promise((resolve, reject) => {
            reject(new ActionNotSupportedError());
        });
    }
    const data = `{"id": ${id}, "command": "${action}_VEHICLE", "responseType": "JSON"}`;
    return makeGmApiPostRequest(endpoint, data);
}



// makeGmApiPostRequest makes http POST requests to the GM API
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



/*
 * Client Errors
 */

class ActionNotSupportedError extends Error {
     constructor() {
         super();
         this.httpStatusCode = 400;
         this.message = "action must be either START or STOP"
     }
}

class IdMustBeNumberError extends Error {
     constructor() {
         super();
         this.httpStatusCode = 400;
         this.message = "vehicle ID must be a number"
     }
}

class MethodNotAllowedError extends Error {
     constructor() {
         super();
         this.httpStatusCode = 405;
         this.message = "Method Not Allowed"
     }
}


module.exports = {
    Get: Get,
    Post: Post
};
