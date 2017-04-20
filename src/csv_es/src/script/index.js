const ESCollection = require('./esCollection.js');
const logger = require('./esLogger.js');
const { getLastCompletedCSV } = require('../../../util/csvUtil.js');

const path = require('path');

const esHost = 'localhost:9200';

const argv = require('minimist')(process.argv.slice(2));

const csvRootDir = argv._[0];

let targetCSV = argv._[1];

const esCollection = new ESCollection(esHost, csvRootDir);

if (targetCSV === 'latest') {
	targetCSV = getLastCompletedCSV(csvRootDir);
}

esCollection._deleteCollectionIndex().then(() => {
	console.log(`Synchronizing ES to CSV ${targetCSV}`);
	return esCollection.syncESToCSV(targetCSV);
}).then(() => {
	return esCollection.description();
}).then((desc) => {
	console.log("Finished export");
	console.dir(desc);
});

// esCollection.description().then(() => {
// 	console.log("Getting description");
// 	return esCollection.description();
// }).then((res) => {
// 	console.log(res);
// 	console.log("Checking if the collection index exists");
// 	return esCollection.collectionIndexExists();
// }).then((res) => {
// 	if (res) {
// 		console.log("Collection index exists --- deleting");
// 		return esCollection.clearCollectionObjects();
// 	} else {
// 		console.log("Collection index does not exist");
// 		return Promise.resolve({});
// 	}
// }).then((res) => {
// 	console.log("Creating the collection index");
// 	return esCollection._configureCollectionIndex();
// }).then((res) => {
// 	console.log(res);
// });
// }).then((res) => {
// 	console.log("Creating the collection metadata");
// 	return esCollection._createCollectionMetadata();
// }).then((res) => {
// 	console.log(res);
// 	console.log("Syncing with CSV");
// 	return esCollection.syncESToCSV(targetCSV);
// }).then(() => {
// 	logger.info(`Updated to csv ${targetCSV}`);
// 	return esCollection.description();
// }).then((res) => {
// 	console.log(res);
// })

// esCollection.init().then(() => {
// 	esCollection.description().then((res) => {
// 		logger.debug(res);
// 	});
// 	return esCollection.syncESToCSV(targetCSV);
// }).then(() => {
// 	logger.info(`Updated to csv ${targetCSV}`);
// });
