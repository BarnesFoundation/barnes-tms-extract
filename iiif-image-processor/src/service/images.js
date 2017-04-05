const execSync = require('child_process').execSync;
const csv = require('fast-csv');

// const serviceMeta = require('../../meta.json');
const ImageUploader = require('../script/imageUploader.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const csvDir = '../../../dashboard/public/output';
const logger = require('../script/imageLogger.js');
const path = require('path');
const PORT = 3000;

function images(options) {
  const imageUploader = new ImageUploader(path.resolve(__dirname, csvDir));
  const websocketUpdater = new WebsocketUpdater("images", PORT, imageUploader);
  this.add('role:images,cmd:tile', (msg, respond) => {
    imageUploader.process();

    respond(null, { success: true });

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

  this.add('role:images,cmd:info', (msg, respond) => {
    respond(null, Object.assign({}, imageUploader.status, { updatePort: PORT }));
  });
}

module.exports = images;