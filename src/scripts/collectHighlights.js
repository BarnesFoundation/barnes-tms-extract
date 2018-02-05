const { csvForEach, getLastCompletedCSV } = require('../util/csvUtil.js');
const path = require('path');
const fs = require('fs');
const https = require('https');
const config = require('config');
const s3 = require('s3');
const credentials = config.Credentials.aws;

const csvRootDirectory = config.CSV.rootDirectory || path.resolve(__dirname, '../dashboard/public/output');
const fileExtension = '.jpg';

const s3Client = s3.createClient({
  s3Options: {
    accessKeyId: credentials.awsAccessKeyId,
    secretAccessKey: credentials.awsSecretAccessKey,
    region: credentials.awsRegion
  }
});

function getResizedImages() {
  return new Promise((resolve) => {
    let resizedImages = [];
    const getResizedImages = s3Client.listObjects({
      s3Params: {
        Bucket: credentials.awsBucket,
        Prefix: 'images/'
      }
    });
    getResizedImages.on('data', (data) => {
      const objects = data['Contents'];
      resizedImages = resizedImages.concat(objects.map((image) => {
        return {
          key: image['Key'].split('/')[1],
          lastModified: image['LastModified']
        };
      }));
    });

    getResizedImages.on('end', () => {
      resolve(resizedImages);
    });
  });
}

const lastCSV = getLastCompletedCSV(csvRootDirectory);
const highlights = [];
csvForEach(path.resolve(csvRootDirectory, lastCSV + '/objects.csv'), (line) => {
  if (line.highlight === 'true') {
    highlights.push(line.id);
  }
}, () => {
  console.log(highlights);
  getResizedImages().then((resizedImages) => {
    let requests = highlights.reduce((promiseChain, id) => {
      return promiseChain.then(() => {
        return new Promise((resolve) => {
          try {
            const imageExists = resizedImages.find((image) => image.key.includes(id) && image.key.includes('_b'));
            if (imageExists) {
              const imageName = path.resolve(__dirname, '../../highlights/' + imageExists.key);
              if (fs.existsSync(imageName)) resolve();
              s3Client.downloadFile({
                localFile: imageName,
                s3Params: {
                  Bucket: credentials.awsBucket,
                  Key: `images/${imageExists.key}`
                }
              }).on('end', () => {
                console.log('finished downloading ' + imageExists.key);
                resolve();
              })
            } else {
              resolve();
            }
          } catch(e) {
            console.log(e);
          }
        });
      });
    }, Promise.resolve());
    requests.then(() => console.log('done'));
  });

});
