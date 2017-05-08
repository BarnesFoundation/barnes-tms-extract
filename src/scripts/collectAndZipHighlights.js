const { csvForEach, getLastCompletedCSV } = require('../util/csvUtil.js');
const path = require('path');
const fs = require('fs');
const https = require('https');
const config = require('config');
const credentials = config.Credentials.aws;

const csvDir = path.resolve(__dirname, '../dashboard/public/output');
const fileExtension = '.jpg';

//open csv
//loop through each line of csv
//push each highlight into the array
//loop through each highlight
//download it to folder
//zip folder

const lastCSV = getLastCompletedCSV(csvDir);
const highlights = [];
csvForEach(path.resolve(csvDir, lastCSV + '/objects.csv'), (line) => {
  if (line.Highlight === 'true') {
    highlights.push(line.invno);
  }
}, () => {
  console.log(highlights);
  let requests = highlights.reduce((promiseChain, invno) => {
    return promiseChain.then(() => {
      return new Promise((resolve) => {
        const url = credentials.barnesImagesUrl + invno + fileExtension;
        const imageName = path.resolve(__dirname, '../../highlights/' + invno);
        if (fs.existsSync(imageName + '.jpg')) {
          resolve();
          return;
        }
        const file = fs.createWriteStream(imageName + fileExtension);
        file.on('finish', () => {
          console.log('finished downloading ' + invno + fileExtension);
          resolve();
        });
        https.get(url, (response) => {
          if (response.statusCode === 404) {
            fs.unlink(imageName + fileExtension);
            file.end();
          } else {
            response.pipe(file);
          }
        });
      });
    }); 
  }, Promise.resolve());
  requests.then(() => console.log('done'));
});
