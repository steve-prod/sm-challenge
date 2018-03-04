/*
 * GmApi.js provides functions to send/retrieve data to/from the GM API
 */

const http = require('http');

 // Get processes GET requests to the Smartcar API and makes appropriate request to GM API
 function Get(endpoint, req, res) {
     if (req.method !== 'GET') {
         return new Promise((resolve, reject) => {reject("Method Not Allowed");});
     }
     const id = req.params.id;
     const data = `{"id": ${id}, "responseType": "JSON"}`;
     return makeGmApiPostRequest(endpoint, data)
 }

 // Post processes POST requests to the Smartcar API and makes appropriate request to GM API
 function Post(endpoint, req, res) {
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

module.exports = {
    Get: Get,
    Post: Post,
};
