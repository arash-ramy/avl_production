const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const deviceController = require("../controller/device");

// RESET DEVICE =>   THIS API IS NOT VERIFIED
router.get("/cmd/reset/:IMEI",headerAuth, deviceController.resetDevice);
// SET INTERVAL => DEVICE => NOTIFYUTITY => SET INTERVAL
router.get("/cmd/interval/:IMEI/:interval",headerAuth, deviceController.setInterval);
// SET APN => DEVICE => NOTIFYUTITY => SET APN
router.get("/cmd/interval/:IMEI/:apnname",headerAuth, deviceController.setAPN);
// SET SOSNumber => DEVICE => NOTIFYUTITY => SET SOSNumber
router.get("/cmd/sos/:IMEI/:sos",headerAuth, deviceController.setSOS);
// SET CONFIGURE => DEVICE => NOTIFYUTITY => SET CONFIGURE
router.get("/cmd/sos/:IMEI/:sos",headerAuth, deviceController.configure);
// get  CONFIGURE => DEVICE => NOTIFYUTITY => SET CONFIGURE
router.get("/last",headerAuth, deviceController.getLastLocationOfAllDevice);
// get  CONFIGURE => DEVICE => NOTIFYUTITY => SET CONFIGURE






router.get("/", deviceController.getDevices);

router.get("/tests",headerAuth, deviceController.tests);

// ADD DEVICE =>
router.post("/add",headerAuth, deviceController.addDevice);
// EDIT DEVICE =>
router.put("/",headerAuth, deviceController.editDevice);
// ADD TYPES OF DEVICES (VEHICLE MODELS)
router.post("/models/add",headerAuth, deviceController.addDeviceModels);
// GET ALL TYPES OF DEVICES (VEHICLE MODELS)
router.get("/models/get",headerAuth, deviceController.getDeviceModels);
// ADD POLYGON 
// router.get("/models/get",headerAuth, deviceController.getDeviceModels);

// THIS API IS NOT COMPLETED AND IS NOT TESTED BY RAMY
// THIS API IS NOT COMPLETED AND IS NOT TESTED BY RAMY
router.delete("/deleteStatus/:id",headerAuth, deviceController.deleteDeviceStatus);

router.post("/getinfo",headerAuth, deviceController.getBachInfoViaIMEI);




// this api is ok ==> sending alarm to email and sms  has been defined 
router.post("/alarmsettings",headerAuth, deviceController.setAlarmSettings);
// this api is ok ==> seting alarms
router.post("/status",headerAuth, deviceController.setDeviceStatus);


router.get("/alarmsettings/:IMEI/:settingsType",headerAuth, deviceController.getAlarmSettings);


router.post("/addpolygon",headerAuth, deviceController.setPolygon);

router.delete("/polygon/:id",headerAuth, deviceController.deletePolygon);


router.post("/lastlocationsinp",headerAuth, deviceController.getLastLocationsOfDeviceInP);


// report pdf status alarms
router.post("/report/alarms",headerAuth, deviceController.reportDeviceAlarms);
router.post("/report/alarms/pdf",headerAuth, deviceController.exportDeviceAlarmsReportToPdf);

// report pdf status 
router.post("/report/status",headerAuth, deviceController.reportDeviceStatus);
router.post("/report/status/pdf",headerAuth, deviceController.exportDeviceStatusReportToPdf);


// report pdf changes  
router.post("/report/changes",headerAuth, deviceController.reportDeviceChanges);
router.post("/report/changes/pdf",headerAuth, deviceController.exportDeviceChangesReportToPdf);


// report pdf of devices and vehicle 
router.post("/report/vehicles",headerAuth, deviceController.reportDriverVehicles);
router.post("/report/vehicles/pdf",headerAuth, deviceController.exportDriverVehiclesReportToPdf);


// report pdf location 
router.post("/report/locations",headerAuth, deviceController.reportDeviceLocations);
router.post("/report/locations/pdf",headerAuth, deviceController.exportDeviceLocationsReportToPdf);




router.post("/tests",headerAuth, deviceController.tests);


module.exports = router;



// BSONObj size: 34076258 (0x207F662) is invalid. Siz…lement: _id: ObjectId('5992786811dc0505f290f86b