const logger = require('../script/imageLogger.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const credentials = require('../../credentials.json');

const { exec, execSync }  = require('child_process');
const path = require('path');
const s3 = require('s3');
const csv = require('fast-csv');
const fs = require('fs');

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
					if (this._imageNeedsUpload(`${row.invno}.jpg`)) {
						imagesToProcess.push(`${row.invno}.jpg`);
					}
				},
				() => {
					this._tileAndUpload(imagesToProcess);
					this._updateTiledList(imagesToProcess).then(() => {
						this.completed();
						this._isRunning = false;
					});
				});
			});
		});
	}

	_updateTiledList(images) {
		const csvStream = csv.createWriteStream({headers: true});
    const writableStream = fs.createWriteStream(path.resolve(__dirname, '../../tiled.csv'));

    return new Promise((resolve) => {
	    writableStream.on("finish", () => {
		  	this._s3Client.uploadFile({
		  		localFile: path.resolve(__dirname, '../../tiled.csv'),
		  		s3Params: {
						Bucket: credentials.awsBucket,
						Key: 'tiled.csv'
					}
		  	})
		  	.on('end', () => {
		  		resolve();
		  	});
		  });

			csvStream.pipe(writableStream);
			this._tiledImages.concat(images).forEach((img) => {
				csvStream.write(img);
			});
			csvStream.end();
		});
	}

	_fetchAvailableImages() {
		logger.info('Starting fetch available images.');
		const getImageUrlPath = path.resolve(__dirname, './getImageUrls.js');
		const outputPath = path.resolve(__dirname, '../../names.json');
		const url = credentials.barnesImagesUrl;
		const cmd = `phantomjs --ignore-ssl-errors=true --ssl-protocol=tlsv1 --web-security=false ${getImageUrlPath} ${url} ${outputPath}`;
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
			this._s3Client.downloadFile({
				s3Params: {
					Bucket: credentials.awsBucket,
					Key: 'tiled.csv'
				},
				localFile: path.resolve(__dirname, '../../tiled.csv')
			})
			.on('error', (err) => {
				if (err.message === "http status code 404") {
					logger.info('Can\'t fetch list of tiled images--hasn\'t been created yet.');
					this._tiledImages = [];
					resolve();
				}
			})
			.on('end', () => {
				logger.info('tiles.csv has been downloaded--loading into memory.');
				csvForEach(path.resolve(__dirname, '../../tiled.csv'), (data) => {
					this._tiledImages.push({name: data.name, size: data.size, modified: data.modified});
				}, () => {
					resolve();
				});
			})
		});
	}

	_imageNeedsUpload(imgName) {
		logger.info(`Checking if image ${imgName} needs upload`);
		const s3Found = this._tiledImages.find((element) => element.name.toLowerCase() === imgName.toLowerCase());
		const tmsFound = this._availableImages.find((element) => element.name.toLowerCase() === imgName.toLowerCase());

		// if the picture is on TMS
		// 		if the picture is on S3 but has changed
		//    or if the picture is not on S3
		//		then it needs upload
		// else it does not
		if (tmsFound) {
			if (s3Found && (s3Found.size !== tmsFound.size || s3Found.modified !== tmsFound.modified)) {
				logger.info(`${imgName} is available on TMS, has already been tiled, but has changed.`);
				return tmsFound;
			} else if (!s3Found) {
				logger.info(`${imgName} is available on TMS, but never has been tiled.`);
				return tmsFound;
			}
			logger.info(`${imgName} is available on TMS, has been tiled, and has not changed.`);
			return false;
		}
		logger.info(`${imgName} is not available on TMS.`);
		return false;
	}

	_tileAndUpload(images) {
		this._numImagesToProcess = images.length;
		this.progress();
		images.forEach((image, index) => {
			logger.info(`Tiling image: ${image.name}, ${index + 1} of ${this._numImagesToProcess}`);
			const cmd = `./go-iiif/bin/iiif-tile-seed -config config.json -endpoint http://barnes-image-repository.s3-website-us-east-1.amazonaws.com/tiles -verbose -loglevel debug ${image.name}`;
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