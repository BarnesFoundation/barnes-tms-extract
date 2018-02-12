const config = require('config');
const path = require('path');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const logger = require('../util/logger.js')(path.join(__dirname, "logs/cron_logs.txt"));

const { makeElasticsearchOptions } = require('../util/elasticOptions.js');
const ESCollection = require('../csv_es/src/script/esCollection.js');
const esCollection = new ESCollection( makeElasticsearchOptions(), config.CSV.rootDirectory );

if (argv.all) {
  esCollection.description().then((desc) => {
    fs.readdir(config.CSV.dataPath, (err, files) => {
      const csvFiles = files.filter(function(file) {
        return file.indexOf('.csv') !== -1;
      });
      csvFiles.forEach((csv) => {
        esCollection.importDataCSVToES(csv);
      });
    })
  });
} else {
  let importCSVTarget = argv.csv || null;
  esCollection.description().then((desc) => {
    if ( importCSVTarget ) {
      logger.info('Preparing index to import ', importCSVTarget);
    } else {
      logger.error('You need to indicate a CSV for import.');
      logger.error('To import specific CSV: node src/scripts/importCSV.js --csv=test.csv');
      logger.error('To import all CSVs in data dir: node src/scripts/importCSV.js --all');
      throw { message: "No CSV to import." };
    }
  }).then(() => {
    esCollection.importDataCSVToES(importCSVTarget);
  });
}



