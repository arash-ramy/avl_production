const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const DeviceGroups = require("../controller/deviceGroupe");


router.get("/", headerAuth,DeviceGroups.getDeviceGroups);
router.put("/", headerAuth,DeviceGroups.editGroup);

router.post("/add", headerAuth,DeviceGroups.addDeviceGroup);
router.get("/:groupId", headerAuth,DeviceGroups.getDeviceGroupById);
router.put("/update", headerAuth,DeviceGroups.editDeviceGroup);
router.post("/device", headerAuth,DeviceGroups.addVehicleToGroup);

router.post("/share", headerAuth,DeviceGroups.shareGroupsWithUser);
router.post("/unshare", headerAuth,DeviceGroups.unshareGroupsWithUser);

router.get("/vehicleofgroup/:groupId", headerAuth,DeviceGroups.getVehiclesofGroup);


module.exports = router;