const express = require("express");
const router = express.Router();

const routeMongodLog = require("../modules/mongodLog/mongodLog.route");
router.use("/log", routeMongodLog);

const routeZimbra = require("../modules/zimbra/zimbra.route");
router.use("/auth-zimbra", routeZimbra);

module.exports = router;
