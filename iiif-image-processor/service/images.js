const execSync = require('child_process').execSync;
const serviceMeta = require('../meta.json');

function images(options) {
  this.add('role:images,cmd:dir', (msg, respond) => {
    execSync('phantomjs --ignore-ssl-errors=true --ssl-protocol=tlsv1 --web-security=false ../script/getImageUrls.js');
  });

  this.add('role:images,cmd:tile', (msg, respond) => {
    // if a csv has already been processed
    if (serviceMeta) {
      // run csv diff
      // see which primary media has been added/appended
      // tile those
    } else {
      // get latest csv
      // do tile and upload
    }
  });
}

module.exports = images;