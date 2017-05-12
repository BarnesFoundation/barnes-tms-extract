const config = require('config');
const path = require('path');
const s3 = require('s3');
const csv = require('fast-csv');
const fs = require('fs');
const https = require('https');
const eachSeries = require('async/eachSeries');

const logger = require('../script/imageLogger.js');
const UpdateEmitter = require('../../../util/updateEmitter.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const fetchAvailableImages = require('./tmsImageFetch.js');
const credentials = config.Credentials.aws;

/**
 * Uploads images (jpgs) to Amazon s3 from TMS
 * @param {string} csvDir - Path to the directory containing csv_* directories exported from TMS
 *  The script will tile and upload images using the most recent complete export in the directory
 */
class ImageUploader extends UpdateEmitter {
	constructor(csvDir) {
		super();
		this._csvDir = csvDir;
		this._s3Client = s3.createClient({
			s3Options: {
				accessKeyId: credentials.awsAccessKeyId,
				secretAccessKey: credentials.awsSecretAccessKey,
				region: credentials.awsRegion
			}
		});
		this._uploadedImages = null;
		this._numImagesToUpload = 0;
		this._currentStep = 'Not started';
		this._isRunning = false;
		this._uploadIndex = 0;
	}

	/**
	 * Initializes the Image Uploader by fetching all images available on TMS and all images already
	 * uploaded to Amazon S3.
	 */
	init() {
		this._isRunning = true;
		this._currentStep = "Fetching image listing on TMS.";
		this.started();
		return fetchAvailableImages().then((outputPath) => {
			const resolvedPath = path.resolve(outputPath);
			this._availableImages = require(resolvedPath).images;
			this._currentStep = "Fetching image listing on S3.";
			this.progress();
			return this._fetchUploadedImages();
		});
	}

	/**
	 * @typedef {Object} ImageUploaderStatus
	 * @description Current status of the Image Uploader script
	 * @name ImageUploader~ImageUploaderStatus
	 * @property {string} type - Always 'imageUploader'
	 * @property {boolean} isRunning - Whether or not the script is running
	 * @property {string} currentStep - Current step in the upload process
	 * @property {number} numImagesUploaded - Total number of images uploaded
	 * @property {number} totalImagesToUpload - Number of images to upload
	 * @property {number} uploadIndex - Number of images uploaded by the current task
	*/ 

	/**
	 * @memberof ImageUploader
	 * @member {ImageUploader~ImageUploaderStatus}
	 */
	get status() {
		return {
			type: 'imageUploader',
			isRunning: this._isRunning,
			currentStep: this._currentStep,
			numImagesUploaded: this._uploadedImages ? this._uploadedImages.length : 0,
			totalImagesToUpload: this._numImagesToUpload,
			uploadIndex: this._uploadIndex

		}
	}

	/**
	 * Begin the process of uploading images to S3
	 */
	process() {
		return new Promise((resolve) => {
			this._currentStep = "Determining which images need to be uploaded to S3.";
			this.progress();
			const lastCSV = getLastCompletedCSV(this._csvDir);
			const csvPath = path.join(this._csvDir, lastCSV, 'objects.csv');
			const imagesToUpload = [];
			csvForEach(csvPath, (row) => {
				const img = this._imageNeedsUpload(`${row.invno}.jpg`);
				if (img) {
					imagesToUpload.push(img);
				}
			},
			() => {
				this._numImagesToUpload = imagesToUpload.length;
				this.progress();
				let index = 1;
				eachSeries(imagesToUpload, (image, cb) => {
					this._currentStep = `Uploading image ${image.name}.`;
					this._uploadIndex = index;
					this.progress();
					this._upload(image).then((err) => {
						if (err) {
							logger.error(err);
						}
						index += 1;
						return this._updateUploadedList(image);
					}).then(() => {
						cb();
					});
				}, () => {
					logger.info('Finished uploading all images.');
					this._currentStep = `Finished uploading all images.`;
					this._isRunning = false;
					this.completed();
					resolve();
				});
			});
		});
	}

	_fetchUploadedImages() {
		logger.info('Beginning to fetch images already uploaded.')
		this._uploadedImages = [];
		return new Promise((resolve) => {
			this._s3Client.downloadFile({
				s3Params: {
					Bucket: credentials.awsBucket,
					Key: 'uploaded.csv'
				},
				localFile: path.resolve(__dirname, '../../uploaded.csv'),
			})
			.on('error', (err) => {
				if (err.message.includes('404')) {
					logger.info('Can\'t fetch list of uploaded images--hasn\'t been created yet.');
					resolve();
				} else {
					throw err;
				}
			})
			.on('end', () => {
				logger.info('uploaded.csv has been downloaded--loading into memory.');
				csvForEach(path.resolve(__dirname, '../../uploaded.csv'), (data) => {
					this._uploadedImages.push({ name: data.name, size: data.size, modified: data.modified });
				}, () => {
					this.progress();
					resolve();
				});
			})
		});
	}

	_imageNeedsUpload(imgName) {
		logger.info(`Checking if image ${imgName} needs upload.`);
		const s3Found = this._uploadedImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());
		const tmsFound = this._availableImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());

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

	_upload(image) {
		return new Promise((resolve) => {
			const localImagePath = path.resolve(__dirname, `./${image.name}`);
			const file = fs.createWriteStream(localImagePath);
			https.get(`${credentials.barnesImagesUrl}${image.name}`, (response) => {
				response.pipe(file);
				file.on('finish', () => {
					logger.info(`Uploading image ${image.name}`);
					this._s3Client.uploadFile({
						s3Params: {
							Bucket: credentials.awsBucket,
							Key: `assets/${image.name}`,
						},
						localFile: localImagePath,
					})
					.on('err', (err) => {
						resolve(err);
					})
					.on('end', () => {
						fs.unlink(localImagePath);
						resolve();
					});
				});
			});
		});
	}

	_updateUploadedList(image) {
		logger.info('Uploading uploaded.csv to S3 bucket.');
		const csvStream = csv.createWriteStream({ headers: true });
		const writableStream = fs.createWriteStream(path.resolve(__dirname, '../../uploaded.csv'));

		return new Promise((resolve) => {
			writableStream.on('finish', () => {
				this._s3Client.uploadFile({
					localFile: path.resolve(__dirname, '../../uploaded.csv'),
					s3Params: {
						Bucket: credentials.awsBucket,
						Key: 'uploaded.csv',
					},
				})
				.on('end', () => {
					resolve();
				});
			});

			csvStream.pipe(writableStream);
			this._uploadedImages.push(image);
			this._uploadedImages.forEach((img) => {
				csvStream.write(img);
			});
			csvStream.end();
		});
	}
}

module.exports = ImageUploader;
