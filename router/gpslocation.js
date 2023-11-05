const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const GPSController = require("../controller/gpslocation");

router.get("/",headerAuth, GPSController.getGPSData);


router.get("/:id/:skip/:count",headerAuth, GPSController.getGPSDataIMEI);

router.get("/group/IMEI",headerAuth, GPSController.getAllIMEIs);

module.exports = router;