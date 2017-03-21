const ESCollection = require('./esCollection.js');
const logger = require('./esLogger.js');

const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const esHost = 'localhost:9200';

const argv = require('minimist')(process.argv.slice(2));

const esCollection = new ESCollection(esHost);

const csvRootDir = argv._[0];

const targetCSV = argv._[1];

// const targetCSV = "csv_1490116277839";
// const targetCSV = "csv_1490116308362";
// const targetCSV = "csv_1490117985331";

function csvCompleted(csvDirPath) {
	const metapath = path.join(csvDirPath, 'meta.json');
	try {
		const status = JSON.parse(fs.readFileSync(metapath, 'utf8')).status;
		return status.toLowerCase() === 'completed';
	} catch (e) {
		return false;
	}
}

function getLastCompletedCSV(csvRootDir) {
	let dirs = fs.readdirSync(csvRootDir);
	dirs = _.filter(dirs, (d) => d.startsWith("csv_")).sort();
	dirs = _.filter(dirs, (d) => csvCompleted(path.join(csvRootDir, d)));
	if (dirs.length > 0) return dirs.pop();
	return null;
}

// esCollection.init().then(() => {
// 	return esCollection.clearCollectionObjects();
// }).then(() => {
// 	const cp = targetCSV;
// 	return esCollection.syncESWithCSV(path.join(csvRootDir, cp, 'objects.csv'));
// });

esCollection.init().then(() => {
	return esCollection.syncESToCSV(path.join(csvRootDir, targetCSV, "objects.csv"));
}).then(() => {
	logger.info("Updated to csv " + targetCSV);
});
