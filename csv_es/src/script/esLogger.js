const sharedLogger = require('../../../util/logger.js');

const path = require('path');

const config = require(path.resolve(__dirname, '../../config.json'));

module.exports = sharedLogger(path.resolve(__dirname + '/../../', config.log));
