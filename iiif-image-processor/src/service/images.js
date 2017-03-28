const execSync = require('child_process').execSync;
const csv = require('fast-csv');

// const serviceMeta = require('../../meta.json');
const ImageUploader = require('../script/imageUploader.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const csvDir = '../../../dashboard/public/output';
const logger = require('../script/imageLogger.js');
const path = require('path');

function images(options) {
  this.add('role:images,cmd:tile', (msg, respond) => {
    // get available images
    const imageUploader = new ImageUploader();
    imageUploader.init();
    logger.info('images directory polled successfully.');

    const lastCSV = getLastCompletedCSV(path.resolve(__dirname, csvDir));
    const csvPath = path.resolve(__dirname, path.join(csvDir, lastCSV, 'objects.csv'));
    csvForEach(csvPath, (row) => {
      logger.info('iterating through csv row');
      if (imageUploader.imageNeedsUpload(row.primaryMedia)) {
        imageUploader.tileAndUpload(row.primaryMedia);
      }
    });
    respond(null, null);

    // // if a csv has already been processed
    // if (serviceMeta) {
    //   // run csv diff
    //   // see which primary media has been added/appended
    //   // tile those
    // } else {
    //   // get latest csv
    //   // do tile and upload
    // }
  });
}

module.exports = images;