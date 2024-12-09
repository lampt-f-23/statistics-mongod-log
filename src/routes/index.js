const express = require("express");
const router = express.Router();

const routeMongodLog = require("../modules/mongodLog/mongodLog.route");
router.use("/log", routeMongodLog);

const routeZimbra = require("../modules/zimbra/zimbra.route");
router.use("/auth-zimbra", routeZimbra);

const routeImportInternal = require("../modules/importInternal/import.route");
router.use("/import", routeImportInternal);

module.exports = router;
