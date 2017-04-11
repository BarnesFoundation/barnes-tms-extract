const logger = require('../script/imageLogger.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');

const { exec, execSync } = require('child_process');
const config = require('config');
const path = require('path');
const s3 = require('s3');
const AWS = require('aws-sdk');
const csv = require('fast-csv');
const fs = require('fs');
const https = require('https');
const tmp = require('tmp');
const eachSeries = require('async/eachSeries');

const credentials = config.Credentials.aws;

/**
 * Tiles and uploads images to Amazon s3
 * @param {string} csvDir - Path to the directory containing csv_* directories exported from TMS
 *  The script will tile and upload images using the most recent complete export in the directory
 */
class ImageUploader extends UpdateEmitter {
	constructor(csvDir) {
		super();
		this._csvDir = csvDir;
		this._isRunning = false;
		this._availableImages = null;
		this._tiledImages = null;
		this._rawImages = null;
		this._numImagesProcessed = 0;
		this._numImagesToProcess = 0;
		this._currentStep = 'Not started.';
		logger.info('creating image logger');
		const cred = new AWS.SharedIniFileCredentials({
			profile: 'barnes',
		});
		const awss3 = new AWS.S3({
			credentials: cred,
			region: credentials.awsRegion,
		});
		this._s3Client = s3.createClient({
			s3Client: awss3,
		});
		this._fetchRawImages();
		this._fetchTiledImages();
	}

	/**
	 * @typedef {Object} ImageUploaderStatus
	 * @description Current status of the Image Uploader script
	 * @name ImageUploader~ImageUploaderStatus
	 * @property {string} type - Always 'imageUploader'
	 * @property {number} totalImagesToUpload - Number of images to upload
	 * @property {number} numImagesUploaded - Number of images uploaded
	 * @property {boolean} isRunning - Whether or not the script is running
	 * @property {string} currentStep - Current step in the upload process
	 * @property {number} numTiledImages - Number of images that have been tiled on s3
	 * @property {nubmer} numRawImages - Number of raw images that have been uploaded to s3
	 */

	/**
	 * @memberof ImageUploader
	 * @member {ImageUploader~ImageUploaderStatus}
	 */
	get status() {
		return {
			type: 'imageUploader',
			totalImagesToUpload: this._numImagesToProcess,
			numImagesUploaded: this._numImagesProcessed,
			isRunning: this._isRunning,
			currentStep: this._currentStep,
			numTiledImages: this._tiledImages ? this._tiledImages.length : 0,
			numRawImages: this._rawImages ? this._rawImages.length : 0,
		};
	}

	/**
	 * Begin the process of tiling and uploading images to s3
	 */
	process() {
		this._isRunning = true;
		this.started();
		logger.info('Starting process to tile images.');
		const imageDirPromise = this._fetchAvailableImages();
		this._currentStep = 'Fetching available images from TMS.';
		this.progress();
		imageDirPromise.then(() => {
			logger.info('Pulled list of available images from TMS successfully.');
			this._currentStep = 'Fetching list of images uploaded to S3.';
			this.progress();
			this._fetchTiledImages().then(() => {
				this._fetchRawImages().then(() => {
					this._currentStep = 'Determining which images need to be uploaded or tiled.';
					this.progress();
					const lastCSV = getLastCompletedCSV(this._csvDir);
					const csvPath = path.join(this._csvDir, lastCSV, 'objects.csv');
					const imagesToProcess = [];
					const imagesToUpload = [];
					csvForEach(csvPath, (row) => {
						const img = this._imageNeedsUpload(`${row.invno}.jpg`);
						if (img) {
							imagesToProcess.push(img);
						}
						const rawImg = this._rawImageNeedsUpload(`${row.invno}.tif`);
						if (rawImg) {
							imagesToUpload.push(rawImg);
						}
					},
					() => {
						this._tileAndUpload(imagesToProcess);
						this._updateTiledList(imagesToProcess);
						this._uploadRaw(imagesToUpload);
						this._updateRawList(imagesToUpload).then(() => {
							this._currentStep = 'Finished.';
							this._isRunning = false;
							this.completed();
						});
					});
				});
			});
		});
	}

	_updateTiledList(images) {
		const csvStream = csv.createWriteStream({ headers: true });
		const writableStream = fs.createWriteStream(path.resolve(__dirname, '../../tiled.csv'));

		return new Promise((resolve) => {
			writableStream.on('finish', () => {
				this._s3Client.uploadFile({
					localFile: path.resolve(__dirname, '../../tiled.csv'),
					s3Params: {
						Bucket: credentials.awsBucket,
						Key: 'tiled.csv',
					},
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

	_updateRawList(images) {
		const csvStream = csv.createWriteStream({ headers: true });
		const writableStream = fs.createWriteStream(path.resolve(__dirname, '../../raw.csv'));

		return new Promise((resolve) => {
			writableStream.on('finish', () => {
				this._s3Client.uploadFile({
					localFile: path.resolve(__dirname, '../../raw.csv'),
					s3Params: {
						Bucket: credentials.awsBucket,
						Key: 'raw.csv',
					},
				})
				.on('end', () => {
					resolve();
				});
			});

			csvStream.pipe(writableStream);
			this._rawImages.concat(images).forEach((img) => {
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
				this._availableImages = require('../../names.json').images; // eslint-disable-line
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
					Key: 'tiled.csv',
				},
				localFile: path.resolve(__dirname, '../../tiled.csv'),
			})
			.on('error', (err) => {
				if (err.message === 'http status code 404') {
					logger.info('Can\'t fetch list of tiled images--hasn\'t been created yet.');
					this._tiledImages = [];
					resolve();
				} else {
					throw err;
				}
			})
			.on('end', () => {
				logger.info('tiles.csv has been downloaded--loading into memory.');
				csvForEach(path.resolve(__dirname, '../../tiled.csv'), (data) => {
					this._tiledImages.push({ name: data.name, size: data.size, modified: data.modified });
				}, () => {
					this.progress();
					resolve();
				});
			});
		});
	}

	_fetchRawImages() {
		logger.info('Starting to fetch raw images uploaded.');
		this._rawImages = [];
		return new Promise((resolve) => {
			this._s3Client.downloadFile({
				s3Params: {
					Bucket: credentials.awsBucket,
					Key: 'raw.csv',
				},
				localFile: path.resolve(__dirname, '../../raw.csv'),
			})
			.on('error', (err) => {
				if (err.message === 'http status code 404') {
					logger.info('Can\'t fetch list of raw images--hasn\'t been created yet.');
					this._rawImages = [];
					resolve();
				} else {
					throw err;
				}
			})
			.on('end', () => {
				logger.info('raw.csv has been downloaded--loading into memory.');
				csvForEach(path.resolve(__dirname, '../../raw.csv'), (data) => {
					this._rawImages.push({ name: data.name, size: data.size, modified: data.modified });
				}, () => {
					this.progress();
					resolve();
				});
			});
		});
	}

	_imageNeedsUpload(imgName) {
		logger.info(`Checking if image ${imgName} needs upload.`);
		const s3Found = this._tiledImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());
		const tmsFound = this._availableImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());

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

	_tempConfigPath() {
		const tmpDir = tmp.dirSync().name;
		const iiifConfig = config.IIIF;
		const outPath = path.join(tmpDir, 'config.json');
		fs.writeFileSync(outPath, JSON.stringify(iiifConfig));
		return outPath;
	}

	_tileAndUpload(images) {
		const configPath = this._tempConfigPath();
		const goPath = path.relative(process.cwd(), path.resolve(__dirname, './go-iiif/bin/iiif-tile-seed'));
		this._numImagesToProcess = images.length;
		this.progress();
		images.forEach((image, index) => {
			this._currentStep = `Tiling image: ${image.name}`;
			this.progress();
			logger.info(`Tiling image: ${image.name}, ${index + 1} of ${this._numImagesToProcess}`);
			const cmd = `${goPath} -config ${configPath} -endpoint http://barnes-image-repository.s3-website-us-east-1.amazonaws.com/tiles -verbose -loglevel debug ${image.name}`;
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

	_rawImageNeedsUpload(imgName) {
		logger.info(`Checking if raw image ${imgName} needs upload.`);
		const s3Found = this._rawImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());
		const tmsFound = this._availableImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());

		// if the picture is on TMS
		// 		if the picture is on S3 but has changed
		//    or if the picture is not on S3
		//		then it needs upload
		// else it does not
		if (tmsFound) {
			if (s3Found && (s3Found.size !== tmsFound.size || s3Found.modified !== tmsFound.modified)) {
				logger.info(`${imgName} is available on TMS, has already been uploaded, but has changed.`);
				return tmsFound;
			} else if (!s3Found) {
				logger.info(`${imgName} is available on TMS, but never has been uploaded.`);
				return tmsFound;
			}
			logger.info(`${imgName} is available on TMS, has been uploaded, and has not changed.`);
			return false;
		}
		logger.info(`${imgName} is not available on TMS.`);
		return false;
	}

	_uploadRaw(images) {
		this._numImagesToProcess = images.length;
		let index = 1;
		eachSeries(images, (image, cb) => {
			this._currentStep = `Uploading raw image: ${image.name}`;
			this._numImagesProcessed = index;
			this.progress();
			const file = fs.createWriteStream(path.resolve(__dirname, `./${image.name}`));
			https.get(`${credentials.barnesImagesUrl}${image.name}`, (response) => {
				response.pipe(file);
				file.on('finish', () => {
					logger.info(`Uploading raw image ${image.name}.`);
					this._s3Client.uploadFile({
						s3Params: {
							Bucket: credentials.awsBucket,
							Key: `raw/${image.name}`,
						},
						localFile: path.resolve(__dirname, `./${image.name}`),
					})
					.on('err', (err) => {
						cb(err);
					})
					.on('end', () => {
						index += 1;
						fs.unlink(path.resolve(__dirname, `./${image.name}`), cb);
					});
				});
			});
		}, (err) => {
			logger.info('Finished uploading all raw images.');
			if (err) logger.error(err);
		});
	}


}

module.exports = ImageUploader;
