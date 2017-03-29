const { exec, execSync }  = require('child_process');
const path = require('path');
const s3 = require('s3');
const logger = require('../script/imageLogger.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const credentials = require('../../credentials.json');

class ImageUploader extends UpdateEmitter {
	constructor(csvDir) {
		super();
		this._csvDir = csvDir;
		this._isRunning = false;
		this._availableImages = null;
		this._tiledImages = null;
		this._numImagesProcessed = 0;
		this._numImagesToProcess = 0;
		logger.info('creating image logger');
		this._s3Client = s3.createClient({
			s3Options: {
				accessKeyId: credentials.awsAccessKeyId,
				secretAccessKey: credentials.awsSecretAccessKey,
				region: credentials.awsRegion
			}
		});
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
			this._fetchTiledImages().then(() => {					
				const lastCSV = getLastCompletedCSV(this._csvDir);
				const csvPath = path.join(this._csvDir, lastCSV, 'objects.csv');
				const imagesToProcess = [];
				csvForEach(csvPath, (row) => {
					if (this._imageNeedsUpload(row.primaryMedia)) {
						imagesToProcess.push(row.primaryMedia);
					}
				},
				() => {
					this._tileAndUpload(imagesToProcess);
					this._isRunning = false;
					this.completed();
				});
			});
		});
	}

	_fetchAvailableImages() {
		logger.info('Starting fetch available images.');
		const getImageUrlPath = path.resolve(__dirname, './getImageUrls.js');
		const outputPath = path.resolve(__dirname, '../../names.json');
		const cmd = `phantomjs --ignore-ssl-errors=true --ssl-protocol=tlsv1 --web-security=false ${getImageUrlPath} ${outputPath}`;
		// const cmd = `echo Hello`;
		return new Promise((resolve) => {
			const phantom = exec(cmd, () => {
				this._isInitialized = true;
				this._availableImages = require('../../names.json').images;
				resolve();
			});
			phantom.stdout.pipe(process.stdout);
		});
	}

	_fetchTiledImages() {
		logger.info('Starting to fetch images already tiled.');
		this._tiledImages = [];
		return new Promise((resolve) => {
			this._s3Client.listObjects({
				s3Params: {
					Bucket: credentials.awsBucket,
					Prefix: 'tiles/',
					Delimiter: '/',
					MaxKeys: 10000
				}
			})
			.on('data', (data) => {
				this._tiledImages = this._tiledImages.concat(data.CommonPrefixes.map((prefix) => {
					return prefix.Prefix.split('/')[1];
				}));
			})
			.on('end', () => {
				resolve();
			})
		});
	}

	_imageNeedsUpload(primaryMedia) {
		if (!primaryMedia || primaryMedia.length === 0) return false;

		const s3Found = this._tiledImages.find((element) => element === primaryMedia);
		if (s3Found) {
			logger.info(`Primary media ${primaryMedia} already on S3, skipping.`);
			return false;
		}

		const found = this._availableImages.find((element) => {
			return element.name === primaryMedia
		});
		if (!found) {
			logger.info(`Primary media ${primaryMedia} exists but is not on TMS.`);
		}
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