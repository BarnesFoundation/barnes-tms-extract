const config = require('config');
const path = require('path');

const ESCollection = require('../../csv_es/src/script/esCollection.js');
const { makeElasticsearchOptions } = require('../../util/elasticOptions.js');

const logger = require('../../csv_es/src/script/esLogger.js');

const argv = require('minimist')(process.argv.slice(2));
const csvRootDir = 'src/dashboard/public/output/';
const csvFileName = csvRootDir+'csv_'+argv.timestamp+'/objects.csv';
const csvPath = path.basename(path.dirname(csv));

logger.info(csvPath);
logger.info('Beginning import of', csvPath, '...');

const esOptions = makeElasticsearchOptions();
const esCollection = new ESCollection(esOptions, csvRootDir);

esCollection.syncESToCSV(csvPath);
