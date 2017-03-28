const execSync = require('child_process').execSync;

function images(options) {
  this.add('role:images,cmd:dir', (msg, respond) => {
    execSync('phantomjs ../script/getImageUrls.js');
  });
}

module.exports = images;