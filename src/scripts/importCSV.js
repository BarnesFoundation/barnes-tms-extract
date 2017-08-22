const config = require('config');
const path = require('path');
const logger = require('../util/logger.js')(path.join(__dirname, "logs/cron_logs.txt"));
const { makeElasticsearchOptions } = require('../util/elasticOptions.js');
const ESCollection = require('../csv_es/src/script/esCollection.js');

const argv = require('minimist')(process.argv.slice(2));

logger.info(argv.csv);

let importCSVTarget = argv.csv || null;

const esCollection = new ESCollection( makeElasticsearchOptions(), config.CSV.path );

esCollection.description().then((desc) => {
  if ( importCSVTarget ) {
    logger.info('Preparing index to import ', importCSVTarget);
    return esCollection._prepareIndexForSync();
  } else {
    logger.error('You need to indicate a CSV for import.');
    logger.error('Usage: node src/scripts/importCSV.js --csv=test.csv');
    throw { message: "No CSV to import." };
  }
}).then(() => {
  esCollection.importDataCSVToES(importCSVTarget);
});


