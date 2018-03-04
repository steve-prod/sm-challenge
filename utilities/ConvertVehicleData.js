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
             res.statusCode = 500;
             res.end("");
         }
         doorData.push(myDoor);
     });
     return doorData;
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
