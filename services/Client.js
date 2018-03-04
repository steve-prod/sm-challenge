/*
 * Client.js provides functions to send data and errors to the client
 */

 function sendData(smartcarData, res, httpStatusCode) {
     res.statusCode = httpStatusCode;
     res.setHeader('Content-Type', 'application/json');
     res.end(JSON.stringify(smartcarData));
 }


 function sendError(err, res) {
     console.log(err);
     res.statusCode = err.httpStatusCode;
     res.end(err.message);
 }

 module.exports = {
     sendData: sendData,
     sendError: sendError
 };
