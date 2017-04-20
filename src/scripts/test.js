const tmsImageFetch = require('../image-processing/src/script/tmsImageFetch.js');
const RawUploader = require('../image-processing/src/script/rawUploader.js');
const TileUploader = require('../image-processing/src/script/tileUploader.js');
const path = require('path');
const csvPath = require('config').CSV.path;

tmsImageFetch().then((outputPath) => {
  try {
    const tileUploader = new TileUploader(outputPath, csvPath);
    tileUploader.init().then(() => {
      tileUploader.process();
    }).catch((err) => {
      console.log(err);
    });
  } catch (e) {
    console.log(e);
  }
});