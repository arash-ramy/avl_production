const express = require("express");
const router = express.Router();
const { headerAuth } = require("../utils/authHeader");
const deviceController = require("../controller/device");


router.post("/add",headerAuth, deviceController.addDevice);
router.post("/edit",headerAuth, deviceController.editDevice);



router.post("/models/add",headerAuth, deviceController.addDeviceModels);


router.post("/tests",headerAuth, deviceController.tests);


module.exports = router;