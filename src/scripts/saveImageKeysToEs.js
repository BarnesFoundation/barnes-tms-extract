const config = require('config');
const s3 = require('s3');
const path = require('path');
const eachSeries = require('async/eachSeries');

const { getLastCompletedCSV, csvForEach } = require('../util/csvUtil.js');
const ESCollection = require('../csv_es/src/script/esCollection.js');
const credentials = config.Credentials.aws;
const csvDir = config.CSV.path;
const { makeElasticsearchOptions } = require('../util/elasticOptions.js');

function getAvailableImages() {
  return new Promise((resolve) => {
    let availableImages = [];
    const getAllImages = s3Client.listObjects({
      s3Params: {
        Bucket: credentials.awsBucket,
        Prefix: 'images/'
      }
    });
    getAllImages.on('data', (data) => {
      const objects = data['Contents'];
      availableImages = availableImages.concat(objects.map((image) => {
        return {
          key: image['Key'].split('/')[1],
          lastModified: image['LastModified']
        };
      }));
    });

    getAllImages.on('end', () => {
      resolve(availableImages);
    });
  });
}

 const s3Client = s3.createClient({
  s3Options: {
    accessKeyId: credentials.awsAccessKeyId,
    secretAccessKey: credentials.awsSecretAccessKey,
    region: credentials.awsRegion
  }
});

const esClient = new ESCollection(makeElasticsearchOptions(), csvDir);

const lastCSV = getLastCompletedCSV(csvDir);
const csvPath = path.join(csvDir, lastCSV, 'objects.csv');

const imagesToUpdate = [];
getAvailableImages().then(availableImages => {
  return new Promise(resolve => {
    csvForEach(csvPath, (row) => {
      const resizedImage = availableImages.find((image) => image.key.startsWith(row.id) && !image.key.includes('_o'));
      const originalImage = availableImages.find((image) => image.key.startsWith(row.id) && image.key.includes('_o'));
      if (resizedImage) {
        const imageSecret = resizedImage.key.split('_')[1];
        const imageOriginalSecret = originalImage.key.split('_')[1];
        imagesToUpdate.push({id: row.id, imageSecret, imageOriginalSecret});
      }
    }, resolve);
  });
}).then(() => {
  eachSeries(imagesToUpdate, (image, cb) => {
    esClient._updateDocumentWithData(image.id, {
      imageSecret: image.imageSecret,
      imageOriginalSecret: image.imageOriginalSecret
    }).then(cb);
  }, () => {
    console.log('updated all documents!');
  });
});