const config = require('config');
const ESCollection = require('../csv_es/src/script/esCollection.js');

const esCollection = new ESCollection( config.Elasticsearch.host, config.CSV.path);
esCollection._updateMappings();
