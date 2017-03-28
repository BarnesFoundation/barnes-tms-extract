const { exec, execSync }  = require('child_process');
const path = require('path');
const logger = require('../script/imageLogger.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');

class ImageUploader extends UpdateEmitter {
	constructor(csvDir) {
		super();
		this._csvDir = csvDir;
		this._isRunning = false;
		this._availableImages = null;
		this._numImagesProcessed = 0;
		this._numImagesToProcess = 0;
		logger.info('creating image logger');
	}

	get status() {
		return {
			type: "imageUploader",
			totalImagesToUpload: this._numImagesToProcess,
			numImagesUploaded: this._numImagesProcessed,
			isRunning: this._isRunning
		};
	}

	process() {
		this._isRunning = true;
		this.started();
		logger.info('Starting process to tile images.');
		const imageDirPromise = this._fetchAvailableImages();
		imageDirPromise.then(() => {
			logger.info('Pulled list of available images from TMS successfully.');
			const lastCSV = getLastCompletedCSV(this._csvDir);
			const csvPath = path.join(this._csvDir, lastCSV, 'objects.csv');
			console.log(csvPath);
			const imagesToProcess = [];
			csvForEach(csvPath, (row) => {
        if (this._imageNeedsUpload(row.primaryMedia)) {
        	console.log('image needs upload: ', row.primaryMedia);
          imagesToProcess.push(row.primaryMedia);
        }
      },
      () => {
	      console.log(imagesToProcess);
	      this._tileAndUpload(imagesToProcess);
	      this._isRunning = false;
	      this.completed();
      });
		});
	}

	_fetchAvailableImages() {
		logger.info('Starting fetch available images.');
		const getImageUrlPath = path.resolve(__dirname, './getImageUrls.js');
		const cmd = `phantomjs --ignore-ssl-errors=true --ssl-protocol=tlsv1 --web-security=false ${getImageUrlPath}`;
		return new Promise((resolve) => {
			exec(cmd, () => {
				this._isInitialized = true;
				this._availableImages = require('../../names.json').images;
				console.log(this._availableImages);
				resolve();
			});
		});
	}

	_imageNeedsUpload(primaryMedia) {
		console.log("primaryMedia: ", primaryMedia);
		const found = this._availableImages.find((element) => {
			return element.name === primaryMedia
		});
		console.log(found);
		return found || false;
	}

	_tileAndUpload(imageNames) {
		this._numImagesToProcess = imageNames.length;
		this.progress();
		imageNames.forEach((imageName, index) => {
			logger.info(`Tiling image: ${imageName}, ${index + 1} of ${this._numImagesToProcess}`);
			const cmd = `./go-iiif/bin/iiif-tile-seed -config config.json -endpoint http://barnes-image-repository.s3-website-us-east-1.amazonaws.com/tiles -verbose -loglevel debug ${imageName}`;
			execSync(cmd, (error, stdout, stderr) => {
			  if (error) {
			    logger.error(`exec error: ${error}`);
			    return;
			  }
			  logger.info(`stdout: ${stdout}`);
			  logger.error(`stderr: ${stderr}`);
			});
			this._numImagesProcessed = index + 1;
			this.progress();
		});
	}


}

module.exports = ImageUploader;