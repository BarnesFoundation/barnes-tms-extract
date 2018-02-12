const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('config');

const logger = require('../script/imageLogger.js');
const credentials = config.Credentials.aws;
const parseTMSImageURL = require('./parseTMSImageURL.js');


function fetchAvailableImages() {
	logger.info('Starting fetch available images.');
	const outputPath = path.resolve(__dirname, '../../names.json');
	return Promise.resolve(outputPath);
}

module.exports = fetchAvailableImages;
