const express = require("express");
const router = express.Router();
const ctl = require("./mongodLog.controller");

router.get("/", ctl.analyzeLogData);

module.exports = router;
