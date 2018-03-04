/*
 * app.js implements a small subset of the Smartcar API spec.
 * It implepements the following Smartcar API endpoints:
 *
 * GET /vehicles/:id
 * GET /vehicles/:id/doors
 * GET /vehicles/:id/fuel
 * GET /vehicles/:id/battery
 * POST /vehicles/:id/engine
 */

// import packages
const express = require('express');

// initialize the app
const app = express();
const port = 3000;
require('./routes/vehicles.js')(app);

app.listen(port, () => console.log(`Smartcar API listening on port ${port}!`));
