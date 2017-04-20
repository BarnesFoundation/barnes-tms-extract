const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let config = {};

config = _.merge(config, require(path.resolve(__dirname, 'base.json')));
config = _.merge(config, require(path.resolve(__dirname, 'credentials.json')));
config = _.merge(config, require(path.resolve(__dirname, 'export.json')));
config.mapping = require(path.resolve(__dirname, 'mapping.json'));
config.Images["IIIF"] = require(path.resolve(__dirname, 'iiif.json'));

const localPath = path.resolve(__dirname, 'local.json');
if (fs.existsSync(localPath)) config = _.merge(config, require(localPath));

module.exports = config;