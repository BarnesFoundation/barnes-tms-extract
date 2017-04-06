const ImageUploader = require('../script/imageUploader.js');
const WebsocketUpdater = require('../../../util/websocketUpdater.js');
const { getLastCompletedCSV, csvForEach } = require('../../../util/csvUtil.js');
const logger = require('../script/imageLogger.js');

const config = require('config');
const csv = require('fast-csv');
const execSync = require('child_process').execSync;
const path = require('path');

const csvDir = config.CSV.path;
const port = config.Server.port;

function images(options) {
  const imageUploader = new ImageUploader(path.resolve(process.cwd(), csvDir));
  const websocketUpdater = new WebsocketUpdater("images", port, imageUploader);
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
    respond(null, Object.assign({}, imageUploader.status, { updatePort: port }));
  });
}

module.exports = images;