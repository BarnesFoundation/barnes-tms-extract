const path = require('path');
const _ = require('lodash');

let config = {};

config = _.merge(config, require(path.resolve(__dirname, 'base.json')));
config = _.merge(config, require(path.resolve(__dirname, 'credentials.json')));
config = _.merge(config, require(path.resolve(__dirname, 'images.json')));

module.exports = config;