const express = require('express');
const router = express.Router();

const route_mongod_log = require('../modules/mongod_log/mongod_log.route');

router.use('/log', route_mongod_log);

module.exports = router;