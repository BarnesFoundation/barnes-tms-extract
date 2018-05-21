const config = require('config');
const s3 = require('s3');
const path = require('path');
const eachSeries = require('async/eachSeries');

const { getLastCompletedCSV, csvForEach } = require('../../util/csvUtil.js');
const ESCollection = require('../../csv_es/src/script/esCollection.js');
const csvRootDirectory = config.CSV.rootDirectory;
const { makeElasticsearchOptions } = require('../../util/elasticOptions.js');

const credentials = config.Credentials.aws;
const s3Client = s3.createClient({
  s3Options: {
    accessKeyId: credentials.awsAccessKeyId,
    secretAccessKey: credentials.awsSecretAccessKey,
    region: credentials.awsRegion
  }
});

const esClient = new ESCollection(makeElasticsearchOptions(), csvRootDirectory);
const lastCSV = getLastCompletedCSV(csvRootDirectory);
const csvPath = path.join(csvRootDirectory, lastCSV, 'objects.csv');

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
      availableImages = availableImages.concat(objects.map(image => {
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

const imagesToUpdate = [];
getAvailableImages().then(availableImages => {
  return new Promise((resolve, reject) => {
    csvForEach(csvPath, (row) => {
      const resizedImage = availableImages.find((image) => image.key.startsWith(row.id) && !(image.key.includes('_o') || image.key.includes('_x')));
      const originalImage = availableImages.find((image) => image.key.startsWith(row.id) && (image.key.includes('_o') || image.key.includes('_x')));
      if (resizedImage || originalImage) {
        const imageSecret = resizedImage && resizedImage.key.split('_')[1];
        const imageOriginalSecret = originalImage && originalImage.key.split('_')[1];
        imagesToUpdate.push({id: row.id, imageSecret, imageOriginalSecret});
      }
    }, resolve)
  })
}).then(() => {
  console.log(`Updating ${imagesToUpdate.length} images`);
  eachSeries(imagesToUpdate, (image, cb) => {
    console.log('updating image ' + image.id);
    esClient._updateDocumentWithData(image.id, {
      imageSecret: image.imageSecret,
      imageOriginalSecret: image.imageOriginalSecret
    }).then(() => {
      cb(null);
    })
  }, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('updated all documents successfully!');
    }
  });
});
