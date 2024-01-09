const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const DeviceGroups = require("../controller/deviceGroupe");

// Retrieve all device groups
router.get("/", headerAuth, DeviceGroups.getDeviceGroups);

// Update a device group
router.put("/", headerAuth, DeviceGroups.editGroup);

// Add a new device group
router.post("/add", headerAuth, DeviceGroups.addDeviceGroup);

// Get a list of custom vehicles
router.get("/getcustomevehicle", headerAuth, DeviceGroups.getCustomeVehicle);

// Get device group by ID
router.get("/:groupId", headerAuth, DeviceGroups.getDeviceGroupById);

// Update device group information
router.put("/update", headerAuth, DeviceGroups.editDeviceGroup);

// Add a vehicle to a device group
router.post("/device", headerAuth, DeviceGroups.addVehicleToGroup);

// Share device groups with a user
router.post("/share", headerAuth, DeviceGroups.shareGroupsWithUser);

// Unshare device groups with a user
router.post("/unshare", headerAuth, DeviceGroups.unshareGroupsWithUser);

// Get vehicles of a specific group
router.get("/vehicleofgroup/:groupId", headerAuth, DeviceGroups.getVehiclesofGroup);

// Remove a vehicle from a group
router.delete("/device/:vehicleId/:groupId", headerAuth, DeviceGroups.removeVehicleFromGroup);

// Get device groups of a user
router.get("/vehicleofgroup/:id", DeviceGroups.getUserDeviceGroups);

// Get vehicles of multiple groups
router.post("/vehicleofgroup", headerAuth, DeviceGroups.getVehiclesofMultiGroup);

// Report vehicles of specific groups for a user
router.get("/report/vehicleofgroup/:groupId/:userId", headerAuth, DeviceGroups.reportVehicleOfGroups);

module.exports = router;