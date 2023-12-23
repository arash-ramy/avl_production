const express = require("express");
const router = express.Router();
console.log("cron test")
const scheduleCron = require("../crons/index");

router.post("/", scheduleCron.scheduleCron);

module.exports = router;