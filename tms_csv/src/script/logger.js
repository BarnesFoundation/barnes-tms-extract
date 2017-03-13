const sharedLogger = require('../../../util/logger.js');

const path = require('path');

module.exports = sharedLogger(path.resolve(__dirname + '/../../logs/all-logs.log'));
