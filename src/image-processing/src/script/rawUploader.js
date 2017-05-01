const path = require('path');
const config = require('config');
const eachSeries = require('async/eachSeries');
const s3 = require('s3');
const csv = require('fast-csv');
const fs = require('fs');
const https = require('https');

const UpdateEmitter = require('../../../util/updateEmitter.js');
const logger = require('../script/imageLogger.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const credentials = config.Credentials.aws;

/**
 * Uploads raw images (tifs) to Amazon s3 from TMS
 * @param {string} pathToAvailableImages - Path to the JSON file containing all available images on TMS
 * @param {string} csvDir - Path to the directory containing csv_* directories exported from TMS
 *  The script will tile and upload images using the most recent complete export in the directory
 */
class RawUploader extends UpdateEmitter {
  constructor(pathToAvailableImages, csvDir) {
    super();
    const resolvedPath = path.resolve(pathToAvailableImages);
    this._availableImages = require(resolvedPath).images;
    this._s3Client = s3.createClient({
      s3Options: {
        accessKeyId: credentials.awsAccessKeyId,
        secretAccessKey: credentials.awsSecretAccessKey,
        region: credentials.awsRegion
      }
    });
    this._csvDir = csvDir;
    this._rawImages = null;
    this._numImagesToUpload = 0;
    this._currentStep = 'Not started';
    this._isRunning = false;
    this._uploadIndex = 0;
  }

  init() {
    return this._fetchRawImages();
  }

  /**
   * @typedef {Object} RawUploaderStatus
   * @description Current status of the Raw Uploader script
   * @name RawUploader~RawUploaderStatus
   * @property {string} type - Always 'rawUploader'
   * @property {boolean} isRunning - Whether or not the script is running
   * @property {string} currentStep - Current step in the tiling process
   * @property {number} numImagesUploaded - Number of images tiled and uploaded
   * @property {number} totalImagesToUpload - Number of images to tile and upload
  */ 

  /**
   * @memberof TileUploader
   * @member {TileUploader~TileUploaderStatus}
   */

  get status() {
    return {
      type: 'rawUploader',
      isRunning: this._isRunning,
      currentStep: this._currentStep,
      numImagesUploaded: this._rawImages ? this._rawImages.length : 0,
      totalImagesToUpload: this._numImagesToUpload,
      this._uploadIndex = this._uploadIndex
    }
  }

  /**
   * Begin the process of uploading raw images to S3
   */
  process() {
    return new Promise((resolve) => {
      this._isRunning = true;
      this.started();
      const lastCSV = getLastCompletedCSV(this._csvDir);
      const csvPath = path.join(this._csvDir, lastCSV, 'objects.csv');
      const imagesToUpload = [];
      csvForEach(csvPath, (row) => {
        const rawImg = this._rawImageNeedsUpload(`${row.invno}.tif`);
        if (rawImg) {
          imagesToUpload.push(rawImg);
        }
      },
      () => {
        this._uploadRaw(imagesToUpload);
        this._updateRawList(imagesToUpload).then(() => {
          this._isRunning = false;
          this.completed();
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
        if (err.message.includes('404')) {
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
          resolve();
        });
      });
    });
  }

  _rawImageNeedsUpload(imgName) {
    logger.info(`Checking if raw image ${imgName} needs upload.`);
    const s3Found = this._rawImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());
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

  _uploadRaw(images) {
    this._numImagesToUpload = images.length;
    let index = 1;
    eachSeries(images, (image, cb) => {
      this._currentStep = `Uploading raw image: ${image.name}`;
      this._uploadIndex = index;
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
            this._uploadIndex = index;
            fs.unlink(path.resolve(__dirname, `./${image.name}`), cb);
          });
        });
      });
    }, (err) => {
      logger.info('Finished uploading all raw images.');
      if (err) logger.error(err);
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

}

module.exports = RawUploader;