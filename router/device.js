const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const deviceController = require("../controller/device");


// ADD DEVICE =>
router.post("/add",headerAuth, deviceController.addDevice);
// EDIT DEVICE =>
router.post("/edit",headerAuth, deviceController.editDevice);
// ADD TYPES OF DEVICES (VEHICLE MODELS)
router.post("/models/add",headerAuth, deviceController.addDeviceModels);
// GET ALL TYPES OF DEVICES (VEHICLE MODELS)
router.get("/models/add",headerAuth, deviceController.getDeviceModels);

router.post("/status",headerAuth, deviceController.setDeviceStatus);

// THIS API IS NOT COMPLETED AND IS NOT TESTED BY RAMY
router.delete("/deleteStatus/:id",headerAuth, deviceController.deleteDeviceStatus);






































router.post("/tests",headerAuth, deviceController.tests);


module.exports = router;