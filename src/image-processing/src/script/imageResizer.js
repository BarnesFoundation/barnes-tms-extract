const path = require('path');
const config = require('config');
const s3 = require('s3');
const { exec, execSync } = require('child_process');
const tmp = require('tmp');
const fs = require('fs-extra');
const { each, eachSeries } = require('async');
const crypto = require('crypto');

const logger = require('../script/imageLogger.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const ESCollection = require('../../../csv_es/src/script/esCollection.js');
const credentials = config.Credentials.aws;

function randomHexValue (len) {
	return crypto.randomBytes(Math.ceil(len/2))
		.toString('hex') // convert to hexadecimal format
		.slice(0,len);   // return required number of characters
}

class ImageResizer extends UpdateEmitter {
	constructor(csvDir, esHost) {
		super();
		this._csvDir = csvDir;
		this._s3Client = s3.createClient({
			s3Options: {
				accessKeyId: credentials.awsAccessKeyId,
				secretAccessKey: credentials.awsSecretAccessKey,
				region: credentials.awsRegion
			}
		});
		this._esClient = new ESCollection(esHost, csvDir);
		this._availableImages = null;
		this._currentStep = 'Not started.';
	}

	init() {
		logger.info('Initializing image resizer.');
		this._currentStep = 'Initializing image resizer.';
		this._isRunning = true;
		this.started();
		return this._getAvailableImages().then(() => {
			logger.info('Fetching listing of all images already resized.');
			return this._getResizedImages();
		});
	}

	process() {
		logger.info('Starting to generate multiple image sizes.');
		this._currentStep = 'Starting to generate multiple image sizes.';
		this.progress();
		return new Promise((resolve) => {
			const lastCSV = getLastCompletedCSV(this._csvDir);
			const csvPath = path.join(this._csvDir, lastCSV, 'objects.csv');
			const imagesToResize = [];
			logger.info('Determining which images need to be resized.');
			this._currentStep = 'Deterining which images need to be resized.';
			this.progress();
			csvForEach(csvPath, (row) => {
				const availableImage = this._availableImages.find((image) => image.key === `${row.invno}.jpg`);
				if (!availableImage) return;
				const resizedImage = this._resizedImages.find((image) => image.key.includes(row.id) && !image.key.includes('_o'));
				const originalImage = this._resizedImages.find((image) => image.key.includes(row.id) && image.key.includes('_o'));
				if (!resizedImage) {
					imagesToResize.push(Object.assign({}, row, availableImage));
					return;
				}
				if (new Date(resizedImage.lastModified) - new Date(availableImage.lastModified) < 0) {
					//get secret key from S3
					const imageSecret = resizedImage.key.split('_')[1];
					const imageOriginalSecret = originalImage.key.split('_')[1];
					imagesToResize.push(Object.assign({}, row, availableImage, { imageSecret, imageOriginalSecret }));
					return;
				}
			}, () => {
				logger.info('Interating through all images that need to be resized.');
				this._currentStep = 'Iterating through all images that need to be resized.';
				this.progress();
				eachSeries(imagesToResize, (image, cb) => {
					logger.info(`Generating images for ${image.invno}.jpg.`);
					this._currentStep = `Generating images for ${image.invno}.jpg.`;
					this.progress();
					this._generateImages(image).then(cb);
				}, (err) => {
					logger.info('Finished resizing all images.');
					this._currentStep = 'Finished resizing all images.';
					this._isRunning = false;
					this.completed();
					resolve();
				});
			});
		});
	}

	get status() {
		return {
			type: 'ImageResizer',
			isRunning: this._isRunning,
			currentStep: this._currentStep
		}
	}

	_downloadImage(image, dir) {
		return new Promise((resolve) => {
			const imagePath = path.resolve(dir, image.key);
			this._s3Client.downloadFile({
				localFile: imagePath,
				s3Params: {
					Bucket: credentials.awsBucket,
					Key: `assets/${image.key}`
				}
			})
			.on('end', () => {
				resolve(imagePath);
			});
		});
	}

	_generateImages(image) {
		return new Promise((resolve) => {
			const tmpDir = tmp.dirSync().name;
			const sizes = [{side: 320, suffix: 'n'}, {side: 1024, suffix: 'b'}, {side: 4096, suffix: 'o'}];
			this._downloadImage(image, tmpDir).then((imagePath) => {
				let secretKey;
				let originalSecretKey;
				if (image.secretKey) {
					secretKey = image.secretKey;
					originalSecretKey = image.originalSecretKey;
				} else {
					secretKey = randomHexValue(16);
					originalSecretKey = randomHexValue(16);
				}
				this._esClient._updateDocumentWithData(image.id, {
					imageSecret: secretKey,
					imageOriginalSecret: originalSecretKey
				});
				const shouldResize = execSync(`identify -format '%[fx:(h>4096 || w>4096)]\n' ${imagePath}`).toString().trim();
				each(sizes, (size, cb) => {
					const key = size.suffix === 'o' ? originalSecretKey : secretKey;
					const resize = size.suffix === 'o' && shouldResize === '0' ? '' : `-thumbnail ${size.side}`
					const newImageName = `${image.id}_${key}_${size.suffix}.jpg`;
					const newImagePath = path.resolve(tmpDir, newImageName);
					fs.copySync(imagePath, newImagePath);

					const cmd = `mogrify -path ${tmpDir} -filter Triangle -define filter:support=2 ${resize} \
					-unsharp 0.25x0.08+8.3+0.045 -dither None -posterize 136 -quality 82 -define jpeg:fancy-upsampling=off -define \
					png:compression-filter=5 -define png:compression-level=9 -define png:compression-strategy=1 -define png:exclude-chunk=all \
					-interlace none -colorspace sRGB ${newImagePath}`;
					// const cmd = `convert ${imagePath} -resize ${size.side}x${size.side} ${newImagePath}`;
					exec(cmd, (error, stdout, stderr) => {
						if (error) {
							console.error(`exec error: ${error}`);
							return;
						}
						if (stdout) logger.info(stdout);
						if (stderr) logger.error(stderr);
						this._s3Client.uploadFile({
							localFile: newImagePath,
							s3Params: {
								Bucket: credentials.awsBucket,
								Key: `images/${newImageName}`
							}
						}).on('end', () => {
							fs.unlink(newImagePath, cb);
						});
					});
				}, () => {
					fs.unlink(imagePath, resolve);
				});
			});
		});
	}

	_getAvailableImages() {
		return new Promise((resolve) => {
			this._availableImages = [];
			const getAllImages = this._s3Client.listObjects({
				s3Params: {
					Bucket: credentials.awsBucket,
					Prefix: 'assets/'
				}
			});
			getAllImages.on('data', (data) => {
				const objects = data['Contents'];
				this._availableImages = this._availableImages.concat(objects.map((image) => {
					return {
						key: image['Key'].split('/')[1],
						lastModified: image['LastModified']
					};
				}));
			});

			getAllImages.on('end', () => {
				resolve();
			});
		});
	}

	_getResizedImages() {
		return new Promise((resolve) => {
			this._resizedImages = [];
			const getResizedImages = this._s3Client.listObjects({
				s3Params: {
					Bucket: credentials.awsBucket,
					Prefix: 'images/'
				}
			});
			getResizedImages.on('data', (data) => {
				const objects = data['Contents'];
				this._resizedImages = this._resizedImages.concat(objects.map((image) => {
					return {
						key: image['Key'].split('/')[1],
						lastModified: image['LastModified']
					};
				}));
			});

			getResizedImages.on('end', () => {
				resolve();
			});
		});
	}
}

module.exports = ImageResizer;