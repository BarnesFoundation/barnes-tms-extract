const config = require('config');
const { makeElasticsearchOptions } = require('../util/elasticOptions.js');
const ESCollection = require('../csv_es/src/script/esCollection.js');

const esCollection = new ESCollection( makeElasticsearchOptions(), config.CSV.path);
let rebuildCSVTarget = null;
esCollection.description().then((desc) => {
	if (desc.lastImportedCSV !== null) {
		rebuildCSVTarget = desc.lastImportedCSV;
		return esCollection._deleteCollectionIndex();
	} else {
		throw {message: "ES is unsynchronized and cannot be rebuilt"}
	}
}).then(() => {
	return esCollection._createCollectionIndex();
}).then(() => {
	return esCollection.syncESToCSV(rebuildCSVTarget);
}).then(() => {
	return esCollection.description();
}).then((desc) => {
	console.log(desc);
});
