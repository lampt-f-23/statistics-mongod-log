const express = require("express");
const router = express.Router();
const ctl = require("./zimbra.controller");

router.get("/", ctl.zimbraTokenToUser);

module.exports = router;
