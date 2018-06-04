const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('config');
const url = require('url');

const logger = require('../script/imageLogger.js');
const parseTMSImageURL = require('./parseTMSImageURL.js');

function fetchAvailableImages() {
	logger.info('Starting fetch available images.');
	const outputPath = path.resolve(__dirname, '../../names.json');
	//const outputPath = path.resolve(__dirname, '../../names.justone.json');
        //return Promise.resolve(outputPath)
	const { imageUrl, username, password } = config.Credentials.tms;
	let tmsImageUrl = url.parse(imageUrl)
	tmsImageUrl.auth= `${username}:${password}`
	return parseTMSImageURL(tmsImageUrl)
	    .then(res => {
	      fs.writeFileSync(outputPath, JSON.stringify(res));
	      return Promise.resolve(outputPath);
	    })
	    .catch(e => {
	      logger.error(e);
	      process.exit(-1);
	    })
}

module.exports = fetchAvailableImages;
