const express = require("express");
const router = express.Router();
const ctl = require("./mongod_log.controller");

router.get("/", ctl.analyzeLogData);

module.exports = router;
