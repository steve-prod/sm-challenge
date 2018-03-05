## Introduction
This project implements a subset of the Smartcar API Spec using Node.js and Express.  The API implemented herein acts as a proxy between a client and the GM API found at gmapi.azurewebsites.net.  The Smartcar API serves 2 purposes:

1.  The GM API uses a JSON-RPC interface which is infrequently used by app developers today.  The Smartcar API offers developers a sensible REST interface with which to interact.  

2.  The Smartcar API also re-formats data received from the GM API, trimming a lot of unnecessary and useless information from the GM API responses.  

The Smartcar API workflow is as follows:

client         --request-->          Smartcar API        --request-->         GM API

client        <--good-JSON--         Smartcar API        <--bad-JSON--        GM API

## Endpoints
The endpoints implemented are listed below. NOTE: All endpoints expect Content-Type a header of type 'application/json'.

Endpoints Implemented:

### GET /vehicles/:id

Returns general information about the vehicle. NOTE: The GM API does not explicitly consider the existence of 3-door automobiles (e.g., Chevy Silverado).  THIS REPO ASSUMES that if a vehicle is neither 2-door nor 4-door, then it has 3 doors (this case is covered by unit tests).

example response:

{
  "vin": "1213231",
  "color": "Metallic Silver",
  "doorCount": 4,
  "driveTrain": "v8"
}

### GET /vehicles/:id/doors

Returns an array of objects, one per door, with each door's position and whether or not it's locked.
The array is sorted in a door-order: fronts are listed before back doors and within front/back left doors are listed before right doors.

example response:

[
  {
    "location": "frontLeft",
    "locked": true
  },
  {
    "location": "frontRight",
    "locked": true
  }
]

### GET /vehicles/:id/fuel

Returns how full the gas tank is as a percentage IF THE CAR IS NOT ELECTRIC.  If the car is electric, the endpoint returns an error message with a 400 status code.

example response:

{
  "percent": 30
}

### GET /vehicles/:id/battery

Returns how charged the battery is as a percentage IF THE CAR IS ELECTRIC.  If the car is not electric, the endpoint returns an error message with a 400 status code.

example response:

{
  "percent": 50
}

### POST /vehicles/:id/engine

Expects a JSON body of the format

{
  "action": "START|STOP"
}

This endpoint returns whether or the engine action was successful.
responses have the format:

{
  "status": "success|error"
}

## Running the project
As with any Node project,

     npm install

and then

     npm start

## Testing
Testing is done with Mocha & Chai.

To run tests:

     npm test

To generate test coverage analysis:

     npm run coverage

Then open /coverage/lcov-report/index.html in your browser to view report

## Logging
Logging is done with [Bunyan](https://github.com/trentm/node-bunyan).  Logs are always written to the file indicated in /routes/vehicles.js (currently smartcar.log in the root directory) and when the API is run in the foreground, logs are also printed to standard out.  This behavior is easily modified by changing (or removing) stoutStream and fileStream objects at the top of /routes/vehicles.js.  Likewise, there are separate named output streams for requests (smartcar-api-REQUEST), responses (smartcar-api-RESPONSE) and error (smartcar-api-ERROR).  They currently all get written to the same file, but this can also be easily modified.
