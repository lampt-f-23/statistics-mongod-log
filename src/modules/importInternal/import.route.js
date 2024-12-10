const express = require("express");
const router = express.Router();
const ctl = require("./import.controller");

router.post("/", ctl.importJsonTaskCategorySprint);

module.exports = router;
