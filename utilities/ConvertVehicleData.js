/*
 * ConvertVehicleData.js provides functions to convert data from GM API format to
 * Smartcar API format.
 */

 function info(gmData) {
     gmData = JSON.parse(gmData);
     // extract vin, color, doorCount and driveTrain from data
     const vin = gmData.data.vin.value;
     const color = gmData.data.color.value;
     var doorCount;
     // Schrödinger's car: car is simultaneously 2-door AND 4-door -> Return error
     if (gmData.data.fourDoorSedan.value === "True" && gmData.data.twoDoorCoupe.value === "True") {
         // FIXME: res is undefined, throw error instead
         res.statusCode = 500;
         res.end("");
         // IF car is neither 2-door nor 4-door THEN assume car is 3-door
     } else if (gmData.data.fourDoorSedan.value === "False" && gmData.data.twoDoorCoupe.value === "False") {
         doorCount = 3;
     } else if (gmData.data.fourDoorSedan.value === "True") {
         doorCount = 4;
     } else if(gmData.data.twoDoorCoupe.value === "True") {
         doorCount = 2;
     } else {
         // FIXME: res is undefined, throw error instead
         res.statusCode = 500;
         res.end("");
     }
     const driveTrain = gmData.data.driveTrain.value;
     return {vin, color, doorCount, driveTrain};
 }


 function securityStatus(gmData) {
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
             // FIXME: res is undefined, throw error instead
             res.statusCode = 500;
             res.end("");
         }
         doorData.push(myDoor);
     });
     // sort doorData by door location (first by front before rear, then by left before right)
     doorData.sort(doorCompareLocationFunction);
     return doorData;
 }

 // first front < rear, then left < right
 function doorCompareLocationFunction(a, b) {
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
     // TODO: throw error
 }


 function energyToFuel(gmData) {
     gmData = JSON.parse(gmData);
     // cast tankLevel to a number
     return {"percent": +gmData.data.tankLevel.value};
 }


 function energyToBattery(gmData) {
     gmData = JSON.parse(gmData);
     // cast batteryLevel to a number
     return {"percent": +gmData.data.batteryLevel.value}
 }


 function engineAction(gmData) {
     gmData = JSON.parse(gmData);
     var status;
     if (gmData.actionResult.status === "EXECUTED") {
         status = "success";
     } else if (gmData.actionResult.status === "FAILED") {
         status = "error";
     } else {
         // FIXME: res is undefined, throw error instead
         res.statusCode = 500;
         res.end("");
     }
     return {"status": status};
 }

module.exports = {
    info: info,
    securityStatus: securityStatus,
    energyToFuel: energyToFuel,
    energyToBattery: energyToBattery,
    engineAction: engineAction
};
