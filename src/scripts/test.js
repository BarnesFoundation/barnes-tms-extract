const path = require('path');
const csvPath = require('config').CSV.path;

const ImageResizer = require('../image-processing/src/script/imageResizer.js');

const imageResizer = new ImageResizer(csvPath);

imageResizer.init().then(() => {
  imageResizer.process();
});