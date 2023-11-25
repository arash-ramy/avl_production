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






router.get("/",headerAuth, deviceController.getDevices);

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










// this api is ok ==> sending alarm to email and sms  has been defined 
router.post("/alarmsettings",headerAuth, deviceController.setAlarmSettings);
// this api is ok ==> seting alarms
router.post("/status",headerAuth, deviceController.setDeviceStatus);


router.get("/alarmsettings/:IMEI/:settingsType",headerAuth, deviceController.getAlarmSettings);


router.post("/addpolygon",headerAuth, deviceController.setPolygon);

router.delete("/polygon/:id",headerAuth, deviceController.deletePolygon);
















router.post("/tests",headerAuth, deviceController.tests);


module.exports = router;