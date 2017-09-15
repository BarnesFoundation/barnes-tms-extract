const csvTimestamp = 1505491700669;

const config = require('config');
const path = require('path');

const ESCollection = require('../../csv_es/src/script/esCollection.js');
const { makeElasticsearchOptions } = require('../../util/elasticOptions.js');

const logger = require('../../csv_es/src/script/esLogger.js');

const csvRootDir = 'src/dashboard/public/output/';
const csv = csvRootDir+'csv_'+csvTimestamp+'/objects.csv';
const csvDate = new Date(csvTimestamp);
const csvPath = path.basename(path.dirname(csv));

logger.info(csvPath);
logger.info('Beginning import of', csvPath, '...');

const options = makeElasticsearchOptions();

const esCollection = new ESCollection(options, csvRootDir);

esCollection.syncESToCSV(csvPath);

// 'src/dashboard/public/output/csv_1502813474684'
