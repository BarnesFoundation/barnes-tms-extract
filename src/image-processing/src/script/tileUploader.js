const path = require('path');
const config = require('config');
const eachSeries = require('async/eachSeries');
const s3 = require('s3');
const csv = require('fast-csv');
const fs = require('fs');
const tmp = require('tmp');
const { exec, execSync } = require('child_process');

const UpdateEmitter = require('../../../util/updateEmitter.js');
const logger = require('../script/imageLogger.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const fetchAvailableImages = require('./tmsImageFetch.js');
const credentials = config.Credentials.aws;

/**
 * Uploads tiled images, by IIIF spec to Amazon s3 from TMS
 * @param {string} pathToAvailableImages - Path to the JSON file containing all available images on TMS
 * @param {string} csvDir - Path to the directory containing csv_* directories exported from TMS
 *  The script will tile and upload images using the most recent complete export in the directory
 */
class TileUploader extends UpdateEmitter {
  constructor(csvDir) {
    super();
    this._s3Client = s3.createClient({
      s3Options: {
        accessKeyId: credentials.awsAccessKeyId,
        secretAccessKey: credentials.awsSecretAccessKey,
        region: credentials.awsRegion
      }
    });
    this._csvDir = csvDir;
    this._tiledImages = null;
    this._numImagesToTile = 0;
    this._currentStep = 'Not started';
    this._isRunning = false;
    this._uploadIndex = 0;
  }

  /**
   * Initializes the Tile Uploader by fetching all images available on TMS and all images already
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
      return this._fetchTiledImages();
    });
  }

  /**
   * @typedef {Object} TileUploaderStatus
   * @description Current status of the Tile Uploader script
   * @name TileUploader~TileUploaderStatus
   * @property {string} type - Always 'tileUploader'
   * @property {boolean} isRunning - Whether or not the script is running
   * @property {string} currentStep - Current step in the tiling process
   * @property {number} numImagesUploaded - Number of images tiled and uploaded
   * @property {number} totalImagesToUpload - Number of images to tile and upload
   * @property {number} uploadIndex - Number of images uploaded by the current task
  */ 

  /**
   * @memberof TileUploader
   * @member {TileUploader~TileUploaderStatus}
   */
  get status() {
    return {
      type: 'tileUploader',
      isRunning: this._isRunning,
      currentStep: this._currentStep,
      numImagesUploaded: this._tiledImages ? this._tiledImages.length : 0,
      totalImagesToUpload: this._numImagesToTile,
      uploadIndex: this._uploadindex
    }
  }

  /**
   * Begin the process of tiling and uploading images to S3
   */
  process() {
    return new Promise((resolve) => {
      this._currentStep = "Determining which images need to be tiled and uploaded to S3.";
      this.progress();
      const lastCSV = getLastCompletedCSV(this._csvDir);
      const csvPath = path.join(this._csvDir, lastCSV, 'objects.csv');
      const imagesToTile = [];
      csvForEach(csvPath, (row) => {
        const img = this._imageNeedsUpload(`${row.invno}.jpg`);
        if (img) {
          imagesToTile.push(img);
        }
      },
      () => {
        this._numImagesToUpload = imagesToTile.length;
        this.progress();
        let index = 1;
        eachSeries(imagesToTile, (image, cb) => {
          this._currentStep = `Tiling and uploading image ${image.name}.`;
          this._uploadIndex = index;
          this.progress();
          this._tileAndUpload(image).then((err) => {
            if (err) {
              logger.error(err);
            }
            index += 1;
          });
        }, () => {
          logger.info('Finished tiling and uploading all images.');
          this._currentStep = `Finished tiling and uploading all images.`;
          this._isRunning = false;
          this.completed();
          resolve();
        });
      });
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
        if (err.message.includes('404')) {
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

  _imageNeedsUpload(imgName) {
    logger.info(`Checking if image ${imgName} needs upload.`);
    const s3Found = this._tiledImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());
    const tmsFound = this._availableImages.find(element => element.name.toLowerCase() === imgName.toLowerCase());

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
    const iiifConfig = config.Images.IIIF;
    const outPath = path.join(tmpDir, 'config.json');
    fs.writeFileSync(outPath, JSON.stringify(iiifConfig));
    return outPath;
  }

  _tileAndUpload(image) {
    const configPath = this._tempConfigPath();
    const goPath = path.relative(process.cwd(), path.resolve(__dirname, '../../go-iiif/bin/iiif-tile-seed'));
    logger.info(`Tiling image: ${image.name}`);
    const cmd = `${goPath} -config ${configPath} -endpoint http://barnes-image-repository.s3-website-us-east-1.amazonaws.com/tiles -verbose -loglevel debug ${image.name}`;
    execSync(cmd, (error, stdout, stderr) => {
      if (error) {
        logger.error(`exec error: ${error}`);
        return;
      }
      logger.info(`stdout: ${stdout}`);
      logger.error(`stderr: ${stderr}`);
    });
  }

  _updateTiledList(image) {
    logger.info('Uploading tiled.csv to S3 bucket.');
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
      this._tiledImages.push(image);
      this._tiledImages.forEach((img) => {
        csvStream.write(img);
      });
      csvStream.end();
    });
  }

}

module.exports = TileUploader;