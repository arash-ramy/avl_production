const express = require("express");
const router = express.Router();
console.log("cron test")
const something = require("../crons/index");

router.post("/", something.something);

module.exports = router;