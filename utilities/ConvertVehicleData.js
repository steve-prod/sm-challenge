/*
 * ConvertVehicleData.js provides functions to convert data from GM API format
 * to Smartcar API format.
 */



function info(data) {
    const gmData = JSON.parse(data);
    // extract vin, color, doorCount and driveTrain from data
    const vin = gmData.data.vin.value;
    const color = gmData.data.color.value;
    var doorCount;
    // Schrödinger's car: car is simultaneously 2-door AND 4-door -> Return InvalidNumberOfDoorsError
    if (gmData.data.fourDoorSedan.value === "True" && gmData.data.twoDoorCoupe.value === "True") {
        return new InvalidNumberOfDoorsError();
    // IF car is neither 2-door nor 4-door THEN assume car is 3-door
    } else if (gmData.data.fourDoorSedan.value === "False" && gmData.data.twoDoorCoupe.value === "False") {
        doorCount = 3;
    } else if (gmData.data.fourDoorSedan.value === "True") {
        doorCount = 4;
    } else if(gmData.data.twoDoorCoupe.value === "True") {
        doorCount = 2;
    } else {
        return new InvalidNumberOfDoorsError();
    }
    const driveTrain = gmData.data.driveTrain.value;
    return {vin, color, doorCount, driveTrain};
 }



function securityStatus(data) {
    const gmData = JSON.parse(data);
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
            return;
        }
        doorData.push(myDoor);
    });
    if (gmData.data.doors.values.length !== doorData.length)  {
        return new InvalidDoorStatusError();
    }
    // sort doorData by door location (first by front before rear, then by left before right)
    try {
        const result = doorData.sort(doorLocationCompareFunction);
        return doorData;
    } catch(e) {
        return e;
    }
}



// first front < rear, then left < right
function doorLocationCompareFunction(a, b) {
    // check input
    if (!a.location.startsWith("front") && !a.location.startsWith("back")) {
        throw new InvalidDoorRelationshipError();
    }
    if (!b.location.startsWith("front") && !b.location.startsWith("back")) {
        throw new InvalidDoorRelationshipError();
    }
    if (!a.location.endsWith("Left") && !a.location.endsWith("Right")) {
        throw new InvalidDoorRelationshipError();
    }
    if (!b.location.endsWith("Left") && !b.location.endsWith("Right")) {
        throw new InvalidDoorRelationshipError();
    }
    // choose correct value
    if (a.location.startsWith("front") && b.location.startsWith("back")) {
        return -1;
    }
    if (a.location.startsWith("back") && b.location.startsWith("front")) {
        return 1;
    }
    if (a.location.endsWith("Left") && b.location.endsWith("Right")) {
        return -1;
    }
    if (a.location.endsWith("Right") && b.location.endsWith("Left")) {
        return 1;
    }
}



function energyToFuel(data) {
    const gmData = JSON.parse(data);
    if (gmData.data.tankLevel.value === "null") {
        throw new NullTankLevelError();
    }
    // cast tankLevel to a number
    return {"percent": +gmData.data.tankLevel.value};
}



function energyToBattery(data) {
    const gmData = JSON.parse(data);
    if (gmData.data.batteryLevel.value === "null") {
        throw new NullBatteryLevelError();
    }
    // cast batteryLevel to a number
    return {"percent": +gmData.data.batteryLevel.value}
}



function engineAction(data) {
    const gmData = JSON.parse(data);
    var status;
    if (gmData.actionResult.status === "EXECUTED") {
        status = "success";
    } else if (gmData.actionResult.status === "FAILED") {
        status = "error";
    } else {
        return new InvalidEngineActionError();
    }
    return {"status": status};
}



/*
 * Client Errors
 */

class InvalidRequestError extends Error {
     constructor() {
         super();
         this.httpStatusCode = 400;
         this.message = "You have made a logically invalid request."
     }
}

class NullTankLevelError extends InvalidRequestError {
     constructor() {
         super();
         this.httpStatusCode = 400;
         this.message = "You requested the tank level of an electric vehicle.  There is no tank level.";
     }
}

class NullBatteryLevelError extends InvalidRequestError {
     constructor() {
         super();
         this.httpStatusCode = 400;
         this.message = "You requested the battery level of a petroleum-powered vehicle.  There is no battery level.";
     }
}



 /*
  * Server errors
  */

class InvalidDataError extends Error {
    constructor() {
        super();
        // 500 because response from GM API was logically invalid
        this.httpStatusCode = 500;
        this.message = "Smartcar is unable to fulfill this request because there is a problem with the manufacturer's data.";
    }
}

class InvalidNumberOfDoorsError extends InvalidDataError {
    constructor() {
        super();
        this.message = "InvalidNumberOfDoorsError: " + this.message;
    }
}

class InvalidDoorRelationshipError extends InvalidDataError {
    constructor() {
        super();
        this.message = "InvalidDoorRelationshipError: " + this.message;
    }
}

class InvalidDoorStatusError extends InvalidDataError {
    constructor() {
        super();
        this.message = "InvalidDoorStatusError: " + this.message;
    }
}

class InvalidEngineActionError extends InvalidDataError {
    constructor() {
        super();
        this.message = "InvalidEngineActionError: " + this.message;
    }
}



module.exports = {
    info: info,
    securityStatus: securityStatus,
    energyToFuel: energyToFuel,
    energyToBattery: energyToBattery,
    engineAction: engineAction
};
