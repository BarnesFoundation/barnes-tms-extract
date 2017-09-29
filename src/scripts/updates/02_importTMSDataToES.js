const config = require('config');
const path = require('path');
const fs = require('fs');

const ESCollection = require('../../csv_es/src/script/esCollection.js');
const { makeElasticsearchOptions } = require('../../util/elasticOptions.js');

const logger = require('../../csv_es/src/script/esLogger.js');

const csvRootDir = 'src/dashboard/public/output/';
const argv = require('minimist')(process.argv.slice(2));

const importLastCSV = () => {
  fs.readdir(csvRootDir, (err, files) => {
    const csv = csvRootDir + files.pop() + '/objects.csv';
    importDataFromCSV(csv);
  });
}

const importDataFromCSV = (csv) => {
  const csvPath = path.basename(path.dirname(csv));
  logger.info(csvPath);
  logger.info('Beginning import of', csvPath, '...');

  const esOptions = makeElasticsearchOptions();
  const esCollection = new ESCollection(esOptions, csvRootDir);

  esCollection.syncESToCSV(csvPath);
}

if (argv.csv) {
  importDataFromCSV(argv.csv);
} else {
  importLastCSV()
}
