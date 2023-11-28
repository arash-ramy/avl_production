const express = require("express");
const router = express.Router();


const ServerCronJobs = require("../crons/index");

router.post("/crontest", ServerCronJobs.run());

module.exports = router;