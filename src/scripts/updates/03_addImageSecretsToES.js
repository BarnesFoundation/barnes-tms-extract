const config = require('config');
const path = require('path');
const fs = require('fs');
const csv = require('fast-csv');
const eachSeries = require('async/eachSeries');

const { csvForEach } = require('../../util/csvUtil.js');
const ESCollection = require('../../csv_es/src/script/esCollection.js');

const csvDir = config.CSV.imageSecretsPath;
const { makeElasticsearchOptions } = require('../../util/elasticOptions.js');
const esClient = new ESCollection(makeElasticsearchOptions(), csvDir);

const csvPath = path.join(config.CSV.imageSecretsPath, config.CSV.imageSecretsFilename);

esClient._updateESWithImageSecrets(csvPath);


