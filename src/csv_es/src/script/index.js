const ESCollection = require('./esCollection.js');
const logger = require('./esLogger.js');
const { getLastCompletedCSV } = require('../../../util/csvUtil.js');
const { makeElasticsearchOptions } = require('../../../util/elasticOptions.js');

const path = require('path');

const config = require('config');

const argv = require('minimist')(process.argv.slice(2));

const csvRootDir = argv._[0];

const options = makeElasticsearchOptions();

let targetCSV = argv._[1];

const esCollection = new ESCollection(options, csvRootDir);

if (targetCSV === 'latest') {
	targetCSV = getLastCompletedCSV(csvRootDir);
}

esCollection.validateForCSV(targetCSV).then((valid) => {
	console.log(`CSV and ES are ${valid ? "equal" : "not equal"}`);
}).catch((error) => console.log(error));

function _makeOptionsForClient(options) {
		let esCredentials = null;
		if (options.credentials) {
			const upass = config.Credentials.es[options.credentials];
			esCredentials = `${upass.username}:${upass.password}`;
		}

		return {
			host: [
				{
					host: options.host,
					auth: esCredentials || undefined,
					protocol: options.protocol || 'http',
					port: options.port || 9200
				}
			]
		};
	}

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
