const express = require("express");
const router = express.Router();
const ctl = require("./zimbra.controller");

router.post("/", ctl.zimbraTokenToUser);

module.exports = router;
