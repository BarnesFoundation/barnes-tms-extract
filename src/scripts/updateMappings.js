const { makeElasticsearchOptions } = require('../util/elasticOptions.js');
const ESCollection = require('../csv_es/src/script/esCollection.js');

const esCollection = new ESCollection( makeElasticsearchOptions(), config.CSV.path);
esCollection._updateMappings();
