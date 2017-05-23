const config = require('config');
const { makeElasticsearchOptions } = require('../util/elasticOptions.js');
const ESCollection = require('../csv_es/src/script/esCollection.js');

const argv = require('minimist')(process.argv.slice(2));

let rebuildCSVTarget = argv.csv || null;

const esCollection = new ESCollection( makeElasticsearchOptions(), config.CSV.path);
esCollection.description().then((desc) => {
	if (rebuildCSVTarget || desc.lastImportedCSV !== null) {
		rebuildCSVTarget = rebuildCSVTarget || desc.lastImportedCSV;
		return esCollection._deleteCollectionIndex();
	} else {
		throw {message: "ES is unsynchronized and cannot be rebuilt"}
	}
}).then(() => {
	return esCollection._prepareIndexForSync();
}).then(() => {
	return esCollection.syncESToCSV(rebuildCSVTarget);
}).then(() => {
	return esCollection.description();
}).then((desc) => {
	console.log(desc);
});
