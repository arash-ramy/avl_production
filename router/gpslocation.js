const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const GPSController = require("../controller/gpslocation");

// Retrieve all GPS data
router.get("/", headerAuth, GPSController.getGPSData);

// Retrieve all unique IMEIs in a group
router.get("/group/IMEI", headerAuth, GPSController.getAllIMEIs);

// Retrieve GPS data by ID, skip, and count
router.get("/:id/:skip/:count", headerAuth, GPSController.getGPSDataIMEI);

// Retrieve the last N GPS data points for a specific IMEI
router.get("/last/:IMEI/:count", headerAuth, GPSController.getNLastDataIMEI);

// Update addresses of GPS locations
router.get("/generateaddress", headerAuth, GPSController.updateAddressOfLocations);

// Retrieve GPS data report for a specific IMEI
router.get("/report/:IMEI", headerAuth, GPSController.getGPSDataIMEIReport);

// Note: The following route is commented out, as it seems to be a placeholder or unused
// router.get("/gpsdata", headerAuth, deviceController.gpsdata);

module.exports = router;