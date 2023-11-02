const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const DeviceGroups = require("../controller/deviceGroupe");


router.get("/", headerAuth,DeviceGroups.getDeviceGroups);
router.post("/add", headerAuth,DeviceGroups.addDeviceGroup);
router.get("/:groupId", headerAuth,DeviceGroups.getDeviceGroupById);
router.put("/update", headerAuth,DeviceGroups.editDeviceGroup);
router.post("/device", headerAuth,DeviceGroups.addVehicleToGroup);


module.exports = router;