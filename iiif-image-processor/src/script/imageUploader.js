const execSync = require('child_process').execSync;
const path = require('path');
const logger = require('../script/imageLogger.js');

class ImageUploader {
	constructor() {
		this._isInitialized = false;
		this._availableImages = null;
		logger.info('creating image logger');
	}

	init() {
		this._fetchAvailableImages();
		this._isInitialized = true;
	}

	_fetchAvailableImages() {
		logger.info('starting fetch available images');
		const getImageUrlPath = path.resolve(__dirname, './getImageUrls.js');
		logger.info('images script path: ' + getImageUrlPath);
		execSync(`phantomjs --ignore-ssl-errors=true --ssl-protocol=tlsv1 --web-security=false ${getImageUrlPath}`);
		logger.info('phantomjs script finished');

		this._availableImages = require('../../names.json').images;
	}

	imageNeedsUpload(primaryMedia) {
		const found = this._availableImages.find((element) => {
			return element.name === primaryMedia
		});
		return found || false;
	}

	tileAndUpload(name) {
		const cmd = `./go-iiif/bin/iiif-tile-seed -config config.json -endpoint http://barnes-image-repository.s3-website-us-east-1.amazonaws.com/tiles -verbose -loglevel debug ${name}`;
		execSync(cmd, (error, stdout, stderr) => {
		  if (error) {
		    logger.error(`exec error: ${error}`);
		    return;
		  }
		  logger.info(`stdout: ${stdout}`);
		  logger.error(`stderr: ${stderr}`);
		});
	}


}

module.exports = ImageUploader;